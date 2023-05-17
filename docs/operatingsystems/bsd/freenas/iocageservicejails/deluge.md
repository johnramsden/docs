---
title: Deluge jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, deluge
tags: [ freebsd, bsd, jail ]
---

## Deluge jail

Setup for Deluge service jail with iocage.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name deluge \
          boot="on" vnet=on bpf=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.35/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

On Freenas create datasets:

*   Datasets
    *   Deluge Data
        *   ```tank/data/database/deluge/```
    *   Download Datasets
        *   For Complete Torrents ```tank/media/Downloads/Complete```
        *   For Incomplete Torrents ```tank/media/Downloads/Incomplete```
        *   For Torrents ```tank/media/Torrents```

Create media user/group using uid from freenas:

{%ace lang='sh'%}
iocage exec deluge 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount datasets in jail:

Deluge data:

{%ace lang='sh'%}
iocage exec deluge 'mkdir -p /home/media/.config /media/Downloads/Complete /media/Downloads/Incomplete /media/Torrents' && \
iocage exec deluge 'chown media:media /home/media/.config /media/Downloads/Complete /media/Downloads/Incomplete /media/Torrents' && \
iocage fstab --add deluge '/mnt/tank/data/database/deluge /home/media/.config  nullfs rw 0 0' && \
iocage fstab --add deluge '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete  nullfs rw 0 0' && \
iocage fstab --add deluge '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete  nullfs rw 0 0' && \
iocage fstab --add deluge '/mnt/tank/media/Torrents /media/Torrents  nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace lang='sh'%}
iocage fstab --list deluge
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage console deluge
{%endace%}

#### Install Deluge

Install ```deluge``` or ```deluge-cli``` depending on what you want installed. Since this is a headless server I'm only installing the CLI version.

{%ace lang='sh'%}
pkg update && pkg upgrade && pkg install deluge-cli
{%endace%}

#### Init Script

Setup ```/etc/rc.conf```

{%ace lang='sh'%}
sysrc 'deluged_enable=YES' 'deluged_user=media'
{%endace%}

#### Start Service

{%ace lang='sh'%}
service deluged start
{%endace%}
