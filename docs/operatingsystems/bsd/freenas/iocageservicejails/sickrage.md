---
title: sickrage jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, sickrage
tags: [ freebsd, bsd, jail ]
---

## sickrage jail

Setup for sickrage service jail with iocage.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name sickrage \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.37/24" \
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

{%ace lang='sh'%}
iocage exec sickrage 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount datasets in jail:

Sickrage data:

{%ace lang='sh'%}
iocage exec sickrage 'mkdir -p /var/db/sickrage /mnt/backups'
iocage exec sickrage 'chown media:media /var/db/sickrage /mnt/backups'
iocage fstab --add sickrage '/mnt/tank/data/database/sickrage /var/db/sickrage nullfs rw 0 0'
iocage fstab --add sickrage '/mnt/tank/backups/Lilan/Sickrage /mnt/backups nullfs rw 0 0'
{%endace%}

Downloads:

{%ace lang='sh'%}
iocage exec sickrage 'mkdir -p /media/Downloads/Complete /media/Downloads/Incomplete /media/Torrents'
iocage exec sickrage 'chown -R media:media /media'

iocage fstab --add sickrage '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete nullfs rw 0 0' && \
iocage fstab --add sickrage '/mnt/tank/media/Torrents /media/Torrents nullfs rw 0 0'
{%endace%}

Setup directories:

{%ace lang='sh'%}
iocage exec sickrage 'mkdir -p /media/Series/Series /media/Series/Lectures /media/Series/Documentary /media/Series/Anime /media/Series/Animated /media/Series/Podcasts/Audio /media/Series/Podcasts/Video /media/Naddy /media/Movie/Movies /media/Movie/Sports' && iocage exec sickrage 'chown -R media:media /media'
{%endace%}

Repeat for media:

{%ace lang='sh'%}
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

{%ace lang='sh'%}
iocage fstab --list sickrage
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage console sickrage
{%endace%}

### In Jail

Update.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

Install requirements.

{%ace lang='sh'%}
pkg install py27-sqlite3 git
{%endace%}

Install SickRage.

{%ace lang='sh'%}
cd /var/db
git clone  https://github.com/SickRage/SickRage.git temp
mv temp/.git sickrage/
rm -rf temp
chown -R media:media sickrage/
su media
cd sickrage/
git reset --hard HEAD
{%endace%}

Copy the startup script

{%ace lang='sh'%}
mkdir /usr/local/etc/rc.d
cp /var/db/sickrage/runscripts/init.freebsd /usr/local/etc/rc.d/sickrage
{%endace%}

Make startup script executable

{%ace lang='sh'%}
chmod 555 /usr/local/etc/rc.d/sickrage
{%endace%}

Add settings to rc.conf

{%ace lang='sh'%}
sysrc 'sickrage_enable=YES' 'sickrage_user=media' 'sickrage_group=media' 'sickrage_dir=/var/db/sickrage'
{%endace%}

Start SickRage.

{%ace lang='sh'%}
service sickrage start
{%endace%}
