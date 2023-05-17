---
title: pod jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, pod
tags: [ freebsd, bsd, jail ]
---

## pod jail

Setup for pocatcher jail with iocage using 'bashpod', previously 'mashpodder'.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name pod \
          boot="on" vnet=on bpf=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.34/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

Create media user/group using uid from freenas:

{%ace lang='sh'%}
iocage exec pod 'pw useradd -n media -u 8675309'
{%endace%}

Nullfs mount any datasets in jail:

pod data, created on FreeNAS:

{%ace lang='sh'%}
iocage exec pod 'mkdir -p /var/db/pod'
iocage exec pod 'chown media:media /var/db/pod'
iocage fstab --add pod '/mnt/tank/data/database/pod /var/db/pod nullfs rw 0 0'
{%endace%}

Setup directories for downloads:

{%ace lang='sh'%}
iocage exec pod 'mkdir -p /media/Downloads/Complete && chown -R media:media /media'

iocage fstab --add pod '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace lang='sh'%}
iocage fstab --list pod
{%endace%}

Enter jail.

{%ace lang='sh'%}
iocage console pod
{%endace%}

### In Jail

Update.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

### Requirements

{%ace lang='sh'%}
pkg install bash libxslt wget curl git
{%endace%}


### Install bashpod

Clone the script to tempdir and move it to our mounded directory.

{%ace lang='sh'%}
cd /var/db
git clone  https://github.com/johnramsden/bashpod.git temp
mv temp/.git pod/
rm -rf temp
chown -R media:media pod/

su media
cd pod/
git reset --hard HEAD
exit
{%endace%}

Inside `/var/db/pod/bashpod.sh`, set `BASEDIR="/var/db/pod"`.

Symlink the script to `/usr/local/bin/bashpod`.

{%ace lang='sh'%}
ln -s /var/db/pod/bashpod.sh /usr/local/bin/bashpod
{%endace%}

### FreeNAS Task

In order to run from FreeNAS, create a new task that runs the bashpod script.

{%ace lang='sh'%}
iocage exec pod --jail_user media '/usr/local/bin/bashpod'
{%endace%}
