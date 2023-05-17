---
title: pod jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, pod
tags: [ freebsd, bsd, jail ]
---

## pod jail

Setup for zrepl jail with iocage.

### On FreeNAS

Create jail:

zfs create -o mountpoint=none tank/zrepl

{%ace lang='sh'%}
iocage create --release 11.3-RELEASE --name zrepl \
          boot=on vnet=on dhcp=off \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.30.44/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.30.1" \
          resolver="search ramsden.network;nameserver 172.20.30.1;nameserver 8.8.8.8" \
          jail_zfs=on \
          jail_zfs_dataset=repl \
          jail_zfs_mountpoint='none'
{%endace%}

iocage set vnet=on dhcp=off bpf=yes \
          allow_raw_sockets="1" \
          ip4_addr="vnet0|172.20.30.45/24" \
          interfaces="vnet0:bridge1" \
          defaultrouter="172.20.30.1" \
          resolver="search ramsden.network;nameserver 172.20.30.1;nameserver 8.8.8.8" \
          repl

{%ace lang='sh'%}
iocage get jail_zfs_dataset zrepl
{%endace%}

### In Jail

{%ace lang='sh'%}
iocage console zrepl
{%endace%}

Update.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

### Requirements

Create the log file /var/log/zrepl.log

{%ace lang='sh'%}
touch /var/log/zrepl.log && service newsyslog restart
{%endace%}

Tell syslogd to redirect facility local0 to the zrepl.log file:

{%ace lang='sh'%}
service syslogd reload
{%endace%}

Modify the /usr/local/etc/zrepl/zrepl.yml configuration file

Enable the zrepl daemon to start automatically at boot:

{%ace lang='sh'%}
sysrc zrepl_enable="YES"
{%endace%}

Start the zrepl daemon:

{%ace lang='sh'%}
service zrepl start
{%endace%}

