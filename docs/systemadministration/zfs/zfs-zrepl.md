---
title: Sanoid
sidebar: systemadministration_sidebar
hide_sidebar: false
category: [ zfs, systemadministration ]
keywords: zfs
permalink: systemadministration_zfs_mirrors.html
toc: true
folder: systemadministration/zfs
---

Install zrepl binary from [releases](https://github.com/zrepl/zrepl/releases).

{%ace lang='sh'%}
mkdir -p /mnt/tank/system/root/bin
cd /mnt/tank/system/root/bin
wget -O zrepl https://github.com/zrepl/zrepl/releases/download/v0.2.0/zrepl-freebsd-amd64
chmod +x zrepl
{%endace%}

Create config:

{%ace lang='sh'%}
mkdir -p /mnt/tank/system/root/etc/zrepl
{%endace%}

{%ace lang='sh'%}
cat << "EOF" | tee /mnt/tank/system/root/etc/zrepl/zrepl.yml
jobs:
  - name: wooly
    type: pull
    connect:
      type: tls
      address: "172.20.20.3:8888"
      ca: "/mnt/tank/system/root/etc/zrepl/wooly.ramsden.network.crt"
      cert: "/mnt/tank/system/root/etc/zrepl/lilan.ramsden.network.crt"
      key: "/mnt/tank/system/root/etc/zrepl/lilan.ramsden.network.key"
      server_cn: "wooly.ramsden.network"
    root_fs: "tank/replication/wooly"
    interval: 10m
    pruning:
      keep_sender:
        - type: grid
          grid: 1x1h(keep=all) | 24x1h | 60x1d
          regex: "zrepl_.*"
      keep_receiver:
        - type: grid
          grid: 1x1h(keep=all) | 24x1h | 60x1d | 24x30d
          regex: "zrepl_.*"
  - name: enix
    type: pull
    connect:
      type: tls
      address: "172.20.20.2:8888"
      ca: "/mnt/tank/system/root/etc/zrepl/enix.ramsden.network.crt"
      cert: "/mnt/tank/system/root/etc/zrepl/lilan.ramsden.network.crt"
      key: "/mnt/tank/system/root/etc/zrepl/lilan.ramsden.network.key"
      server_cn: "enix.ramsden.network"
    root_fs: "tank/replication/enix"
    interval: 10m
    pruning:
      keep_sender:
        - type: grid
          grid: 1x1h(keep=all) | 24x1h | 60x1d
          regex: "zrepl_.*"
      keep_receiver:
        - type: grid
          grid: 1x1h(keep=all) | 24x1h | 60x1d | 24x30d
          regex: "zrepl_.*"
EOF
{%endace%}

{%ace lang='sh'%}
zrepl configcheck --config /mnt/tank/system/root/etc/zrepl/zrepl.yml
{%endace%}

---

On source:

{%ace lang='sh'%}
cat << "EOF" | sudo tee /etc/zrepl/zrepl.yml
jobs:
- name: pull_source
  type: source
  serve:
    type: tls
    listen: ":8888"
    ca: /etc/zrepl/lilan.ramsden.network.crt
    cert: /etc/zrepl/enix.ramsden.network.crt
    key:  /etc/zrepl/enix.ramsden.network.key
    client_cns:
        - "lilan.ramsden.network"
  filesystems: {
    "vault/sys/enix<": true,
    "vault/data<": true,
    "vault/sys/enix/var/cache": false,
    "vault/sys/enix/var/lib/docker": false,
    "vault/sys/enix/home/john/local/share/Steam<": false,
    "vault/sys/enix/var/lib/postgres<": false,
    "vault/sys/enix/var/lib/mysql<": false,
    "vault/sys/enix/var/lib/lxd<": false,
    "vault/sys/enix/var/lib/lxc<": false,
    "vault/sys/enix/var/lib/machines<": false,
    "vault/sys/enix/var/lib/systemd/coredump<": false,
  }
  snapshotting:
    type: periodic
    prefix: zrepl_
    interval: 5m
EOF
{%endace%}

---

[TLS Transport](https://zrepl.github.io/configuration/transports.html#tls-transport)

On server and client in config directory:

{%ace lang='sh'%}
name=wooly.ramsden.network;
openssl req -x509 -sha256 -nodes \
 -newkey rsa:4096 \
 -days 1095 \
 -keyout $name.key \
 -out $name.crt -addext "subjectAltName = DNS:$name" -subj "/CN=$name"
{%endace%}

copy HOSTNAME.crt to each opposite host

zrepl daemon --config /mnt/tank/system/root/etc/zrepl/zrepl.yml
zrepl status --config /mnt/tank/system/root/etc/zrepl/zrepl.yml

Run daemon on boot (freenas task)

{%ace lang='sh'%}
mkdir -p /var/run/zrepl && \
chmod 700 /var/run/zrepl && \
/usr/sbin/daemon \
    -R 5 \
    -t 'zrepl' -T 'zrepl' \
    -l syslog \
    -P /var/run/zrepl_daemon_supervisor.pid \
    -p /var/run/zrepl_daemon_child.pid \
        /mnt/tank/system/root/bin/zrepl daemon \
            --config /mnt/tank/system/root/etc/zrepl/zrepl.yml
{%endace%}
