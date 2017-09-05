---
title: FreeNAS Service jails
sidebar: bsd_sidebar
hide_sidebar: false
keywords: freenas, bsd, jail
tags: [ freenas, bsd, jail ]
permalink: freenas_service_jails.html
toc: true
folder: bsd/freenas/jails
---

## Deluge

The following sets up the torrent client [net-p2p/deluge](https://www.freshports.org/net-p2p/deluge/)

### FreeNAS Preperation

First set a few things up on FreeNAS.

### Datasets

Use the existing media user from FreeNAS

Create dataset for deluge and mount to ```/home/media/.config```.

### In Jail

Enter the jail.

{% highlight shell %}
jexec deluge tcsh
{% endhighlight shell %}

### Install Deluge

Install cli version.

{% highlight shell %}
pkg update && pkg upgrade
pkg install deluge-cli
{% endhighlight shell %}

### rc

Setup /etc/rc.conf

sysrc 'deluged_enable=YES' 'deluged_user=media'

### Start Deluge

{% highlight shell %}
service deluged start
{% endhighlight shell %}

# Couchpotato

Install and cunfigure [couchpotato](https://couchpota.to/#freebsd)

## FreeNAS UI

Create database dataset couchpotato and mount to ```/var/db/couchpotato``` within FreeNAS.

## In the jail

Enter the jail.

{% highlight shell %}
jexec couchpotato tcsh
{% endhighlight shell %}

### Installing Requirements

Install the required packages.

{% highlight shell %}
pkg update && pkg upgrade
pkg install python py27-sqlite3 fpc-libcurl docbook-xml git-lite
{% endhighlight shell %}

Use user media if it exists, it should match FreeNAS's media user's UID.

### Configuration

cd /var/db


git clone https://github.com/CouchPotato/CouchPotatoServer.git temp
mv temp/.git couchpotato/
rm -rf temp

su media
cd couchpotato
git reset --hard HEAD

exit

Copy the startup script
cp couchpotato/init/freebsd /usr/local/etc/rc.d/couchpotato

Make startup script executable
chmod 555 /usr/local/etc/rc.d/couchpotato

Read the options at the top of more
/usr/local/etc/rc.d/couchpotato

If not default install, specify options with startup flags

sysrc 'couchpotato_enable=YES'
sysrc 'couchpotato_user=media'
sysrc 'couchpotato_dir=/var/db/couchpotato'

Finally,
service couchpotato start

Restart jail

Open your browser and go to:
http://server:5050/

# Emby

## FreeNAS

Create dataset, mount at /var/db/emby

## Jail

Use pkg

```
pkg update && pkg upgrade
pkg install emby-server
```

### FFMpeg

#### Update FreeBSD ports tree

```
portsnap fetch extract update
```

### Remove default FFMpeg package

```
pkg delete -f ffmpeg
```

### Reinstall FFMpeg

Reinstall FFMpeg from ports with lame option enabled

```
cd /usr/ports/multimedia/ffmpeg
make config
# enable the lame option
# enable the ass subtitles option
# enable the opus subtitles option
# enable the x265 subtitles option
make install clean
```

## ImageMagick

### Reinstall ImageMagick from ports

It is recommended to recompile the graphics/ImageMagick package from ports with the following options .

DISABLED (UNSET): 16BIT_PIXEL (to increase thumbnail generation performance)

#### Delete pkg

```
pkg delete -f imagemagick
```

#### Install from ports

```
cd /usr/ports/graphics/ImageMagick
# DISABLED (UNSET): 16BIT_PIXEL
make config
```

Make sure you have DISABLED (UNSET): 16BIT_PIXEL.

```
make install clean
```

## Options

```
chmod 555 /usr/local/etc/rc.d/emby-server
```

Check options

```
less /usr/local/etc/rc.d/emby-server
```

### Enable Emby service

```
sysrc 'emby_server_enable=YES'
sysrc 'emby_server_user=media'
sysrc 'emby_server_group=media'
sysrc 'emby_server_data_dir=/var/db/emby-server'
```

## Start Emby!

```
service emby-server start
```
# Pod

## Requirements

pkg install bash libxslt wget curl

bash requires fdescfs(5) mounted on /dev/fd, add to tasks:
mount -t fdescfs fdesc /mnt/tank/jails/pod/dev/fd

## User

adduser pod
Username: pod
Full name: Podcatcher
Uid (Leave empty for default):
Login group [pod]:
Login group is pod. Invite pod into other groups? []: media
Login class [default]:
Shell (sh csh tcsh git-shell nologin) [sh]: bash
Home directory [/home/pod]:
Home directory permissions (Leave empty for default):
Use password-based authentication? [yes]:
Use an empty password? (yes/no) [no]: yes
Lock out the account after creation? [no]:
Username   : pod
Password   : <blank>
Full Name  : Podcatcher
Uid        : 1001
Class      :
Groups     : pod media
Home       : /home/pod
Home Mode  :
Shell      : /usr/local/bin/bash
Locked     : no
OK? (yes/no): yes
adduser: INFO: Successfully added (pod) to the user database.
Add another user? (yes/no): no
Goodbye!

## Clone bashpod

su pod
cd /home/pod
git clone https://github.com/johnramsden/bashpod.git

## Task

jexec -U pod pod /usr/local/bin/bash -c "/home/pod/bashpod/bashpod.sh"

# Sabnzbd

## FreeNAS

Create dataset, mount at /var/db/sabnzbd

## Jail

pkg update && pkg upgrade && pkg install sabnzbdplus

sysrc 'sabnzbd_enable=YES'
sysrc 'sabnzbd_user=media'
sysrc 'sabnzbd_group=media'
sysrc 'sabnzbd_conf_dir=/var/db/sabnzbd'

Restart jail

Edit config in /var/db/sabnzbd, change host to 0.0.0.0

# SickRage

pkg install py27-sqlite3

cd /var/db
git clone  https://github.com/SickRage/SickRage.git temp
mv temp/.git sickrage/
rm -rf temp
chown -R media:media sickrage/
su media
cd sickrage/
git reset --hard HEAD
ls runscripts/

Copy the startup script
cp /var/db/sickrage/runscripts/init.freebsd /usr/local/etc/rc.d/sickrage

Make startup script executable
chmod 555 /usr/local/etc/rc.d/sickrage

sysrc 'sickrage_enable=YES'
sysrc 'sickrage_user=media'
sysrc 'sickrage_group=media'
sysrc 'sickrage_dir=/var/db/sickrage'

service sickrage start
service sickrage stop

# Syncthing

## Create User Syncthing

On FreeNAS with ID 983, nologin

## In Jail

pkg update && pkg upgrade && pkg install syncthing

Add the following to rc.conf:

sysrc 'syncthing_enable=YES'
sysrc 'syncthing_user=syncthing'
sysrc 'syncthing_group=syncthing'
sysrc 'syncthing_dir=/var/db/syncthing'

### Configure

Start syncthing as an initial test:

service syncthing start

Edit vim /var/db/syncthing/config.xml and change the IP address which the GUI will be accessible from. This will enable accessing the GUI from a remote computer:

Before:

<gui enabled="true" tls="false">
 <address>127.0.0.1:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
After:

<gui enabled="true" tls="false">
 <address>0.0.0.0:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
Restart the service for changes to apply:

service syncthing restart

Finally, access the GUI by pointing a browser to the server's address: replace SERVER_URL with your server's IP or hostname

https://SERVER_URL:8384