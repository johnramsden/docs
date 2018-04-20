---
title: Couchpotato jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, couchpotato
tags: [ freebsd, bsd, jail ]
---

## couchpotato jail

Setup for couchpotato service jail with iocage.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name couchpotato \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.31/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

On Freenas create datasets:

*   Datasets
    *   Couchpotato Data
        *   ```tank/data/database/couchpotato```
    *   Media
        *   For all media ```tank/media/Movies/...```
    *   Downloads
        *   For all Downloads ```tank/media/Downloads/...```

Create media user/group using uid from freenas:

{%ace lang='sh'%}
iocage exec couchpotato 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount datasets in jail:

Couchpotato data:

{%ace lang='sh'%}
iocage exec couchpotato 'mkdir -p /var/db/couchpotato && chown media:media /var/db/couchpotato'
iocage fstab --add couchpotato '/mnt/tank/data/database/couchpotato /var/db/couchpotato nullfs rw 0 0'
{%endace%}

Downloads:

{%ace lang='sh'%}
iocage exec couchpotato 'mkdir -p /media/Downloads/Complete /media/Downloads/Incomplete && chown -R media:media /media/Downloads'

iocage fstab --add couchpotato '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0' && \
iocage fstab --add couchpotato '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete nullfs rw 0 0'
{%endace%}

Setup directories:

{%ace lang='sh'%}
iocage exec couchpotato 'mkdir -p /media/Movie/Movies /media/Movie/Sports && chown -R media:media /media'
{%endace%}

Repeat for media:

{%ace lang='sh'%}
iocage fstab --add couchpotato '/mnt/tank/media/Movie/Movies /media/Movie/Movies nullfs rw 0 0' && \
iocage fstab --add couchpotato '/mnt/tank/media/Movie/Sports /media/Movie/Sports nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace lang='sh'%}
iocage fstab --list couchpotato
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage console couchpotato
{%endace%}

## In Jail

Install [couchpotato](https://couchpota.to/#freebsd) freebsd version from git.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

Install required tools

{%ace lang='sh'%}
pkg install python py27-sqlite3 fpc-libcurl docbook-xml git-lite
{%endace%}

Use user media, clone to a temp repo in ```/var/db```.

{%ace lang='sh'%}
cd /var/db
git clone https://github.com/CouchPotato/CouchPotatoServer.git temp
{%endace%}

Move the bare repo that was just cloned to the dataset we mounted earlier to ```/var/db/couchpotato```.

{%ace lang='sh'%}
mv temp/.git couchpotato/
rm -rf temp
{%endace%}

Switch to the ```media``` user and reset the repo to HEAD.

{%ace lang='sh'%}
su media
cd couchpotato
git reset --hard HEAD
exit
{%endace%}

As root, copy the startup script to ```/usr/local/etc/rc.d``` and make the startup script executable.

{%ace lang='sh'%}
mkdir /usr/local/etc/rc.d
cp /var/db/couchpotato/init/freebsd /usr/local/etc/rc.d/couchpotato
chmod 555 /usr/local/etc/rc.d/couchpotato
{%endace%}

Read the options at the top of ```/usr/local/etc/rc.d/couchpotato```.

If not using the default install, specify options with startup flags.

{%ace lang='sh'%}
sysrc 'couchpotato_enable=YES' 'couchpotato_user=media' 'couchpotato_dir=/var/db/couchpotato'
{%endace%}

Finally, start couchpotato.

{%ace lang='sh'%}
service couchpotato start
{%endace%}

Restart the jail, open your browser and go to [http://server:5050/](http://server:5050/).
