---
title: sabnzbd jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, sabnzbd
tags: [ freebsd, bsd, jail ]
---

## Emby jail

Setup for Emby service jail with iocage.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name sabnzbd \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.32/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

On Freenas create datasets:

*   Datasets
    *   Sabnzbd Data
        *   ```tank/data/database/sabnzbd```
    *   Downloads
        *   For all downloads ```tank/media/Downloads/...```

Create media user/group using uid from freenas:

{%ace lang='sh'%}
iocage exec sabnzbd 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount datasets in jail:

Sabnzbd data:

{%ace lang='sh'%}
iocage exec sabnzbd 'mkdir -p /var/db/sabnzbd' && \
iocage exec sabnzbd 'chown media:media /var/db/sabnzbd' && \
iocage fstab --add sabnzbd '/mnt/tank/data/database/sabnzbd /var/db/sabnzbd nullfs rw 0 0'
{%endace%}

Downloads:

{%ace lang='sh'%}
iocage exec sabnzbd 'mkdir -p /media/Downloads/Complete /media/Downloads/Incomplete && chown -R media:media /media'

iocage fstab --add sabnzbd '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0' && \
iocage fstab --add sabnzbd '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace lang='sh'%}
iocage fstab --list sabnzbd
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage console sabnzbd
{%endace%}

### Jail

Update and install sabnzbd.

{%ace lang='sh'%}
pkg update && pkg upgrade && pkg install sabnzbdplus
{%endace%}

{%ace lang='sh'%}
sysrc 'sabnzbd_enable=YES' 'sabnzbd_user=media' 'sabnzbd_group=media' 'sabnzbd_conf_dir=/var/db/sabnzbd'
{%endace%}

Restart jail

Edit config in ````/var/db/sabnzbd````, change host to ```0.0.0.0```
