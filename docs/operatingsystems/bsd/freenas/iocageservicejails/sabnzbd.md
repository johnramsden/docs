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

{%ace edit=true, lang='sh'%}
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
    *   Sickrage Data
        *   ```tank/data/database/sickrage```
    *   Media
        *   For all media ```tank/media/Series/...```
    *   Downloads
        *   For all downloads ```tank/media/Downloads/...```

Create media user/group using uid from freenas:

{%ace edit=true, lang='sh'%}
iocage exec sickrage 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount datasets in jail:

Sickrage data:

{%ace edit=true, lang='sh'%}
iocage exec sickrage 'mkdir -p /var/db/sickrage /mnt/backups'
iocage exec sickrage 'chown media:media /var/db/sickrage /mnt/backups'
iocage fstab --add sickrage '/mnt/tank/data/database/sickrage /var/db/sickrage nullfs rw 0 0'
iocage fstab --add sickrage '/mnt/tank/backups/Lilan/Sickrage /mnt/backups nullfs rw 0 0'
{%endace%}

Downloads:

{%ace edit=true, lang='sh'%}
iocage exec sickrage 'mkdir -p /media/Downloads/Complete /media/Downloads/Incomplete /media/Torrents'
iocage exec sickrage 'chown -R media:media /media'

iocage fstab --add sickrage '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Torrents /media/Torrents nullfs rw 0 0'
{%endace%}

Setup directories:

{%ace edit=true, lang='sh'%}
iocage exec sickrage 'mkdir -p /media/Series/Series /media/Series/Lectures /media/Series/Documentary /media/Series/Anime /media/Series/Animated /media/Series/Podcasts/Audio /media/Series/Podcasts/Video /media/Naddy /media/Movie/Movies /media/Movie/Sports' && iocage exec sickrage 'chown -R media:media /media'
{%endace%}

Repeat for media:

{%ace edit=true, lang='sh'%}
iocage fstab --add sickrage '/mnt/tank/media/Series/Series /media/Series/Series nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Podcasts/Audio /media/Series/Podcasts/Audio nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Podcasts/Video /media/Series/Podcasts/Video nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Lectures /media/Series/Lectures nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Documentary /media/Series/Documentary nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Anime /media/Series/Anime nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Series/Animated /media/Series/Animated nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Naddy /media/Naddy nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Movie/Movies /media/Movie/Movies nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Movie/Sports /media/Movie/Sports nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace edit=true, lang='sh'%}
iocage fstab --list sickrage
{%endace%}

Start jail and enter.

{%ace edit=true, lang='sh'%}
iocage console sickrage
{%endace%}

### Jail

Enter jail.

{%ace edit=true, lang='sh'%}
jexec sabnzbd tcsh
{%endace%}

Update and install sabnzbd.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade && pkg install sabnzbdplus
{%endace%}

{%ace edit=true, lang='sh'%}
sysrc 'sabnzbd_enable=YES'
sysrc 'sabnzbd_user=media'
sysrc 'sabnzbd_group=media'
sysrc 'sabnzbd_conf_dir=/var/db/sabnzbd'
{%endace%}

Restart jail

Edit config in ````/var/db/sabnzbd````, change host to ```0.0.0.0```