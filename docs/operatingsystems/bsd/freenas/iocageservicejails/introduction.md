---
title: Iocage Service jails
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, deluge, sickrage, sabnzbd, emby, couchpotato, syncthing
tags: [ freebsd, bsd, jail ]
---

# Iocage Service jails

Creating jails on FreeNAS can [now be done](http://doc.freenas.org/11/jails.html#managing-iocage-jails) with [iocage](https://github.com/iocage).

## Iocage Setup

{%ace lang='sh'%}
iocage activate tank
{%endace%}

<!--

### emby

Create jail

{%ace lang='sh'%}
iocage create -r 11.0-RELEASE tag=emby ip4_addr="igb1|170.20.40.36/24" jail_zfs=on vnet=off
{%endace%}

{%ace lang='sh'%}
iocage set vnet=off emby
iocage set ip4_addr="igb0|170.20.40.66/24" emby
iocage set resolver=none emby
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage start emby
iocage console emby
{%endace%}

### FreeNAS

Create dataset, mount at ```/var/db/emby```

### Jail

In the jail, update all packages and install ```emby-server```.

{%ace lang='sh'%}
pkg update && pkg upgrade
pkg install emby-server
{%endace%}

### FFMpeg

It's recommended to install ffmpeg from ports so that certain compile time options can be enabled.

Update the FreeBSD ports tree

{%ace lang='sh'%}
portsnap fetch extract update
{%endace%}

Remove the default ffmpeg package

{%ace lang='sh'%}
pkg delete -f ffmpeg
{%endace%}

Reinstall FFMpeg from ports with lame option enabled

{%ace lang='sh'%}
cd /usr/ports/multimedia/ffmpeg && make config
{%endace%}

*   enable the lame option
*   enable the ass subtitles option
*   enable the opus subtitles option
*   enable the x265 subtitles option

Compile and install.

{%ace lang='sh'%}
make install clean
{%endace%}

### ImageMagick

It is recommended to recompile the graphics/ImageMagick package from ports with the following options .

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)

Delete the imagemagick pkg.

{%ace lang='sh'%}
pkg delete -f imagemagick
{%endace%}

Install from ports

{%ace lang='sh'%}
cd /usr/ports/graphics/ImageMagick && make config
{%endace%}

*   Disable the 16BIT_PIXEL option

{%ace lang='sh'%}
make install clean
{%endace%}

## Emby Start Options

Set the rc script executable.

{%ace lang='sh'%}
chmod 555 /usr/local/etc/rc.d/emby-server
{%endace%}

Check the options.

{%ace lang='sh'%}
less /usr/local/etc/rc.d/emby-server
{%endace%}

Set emby to start on boot and change the options based on setup.

{%ace lang='sh'%}
sysrc 'emby_server_enable=YES'
sysrc 'emby_server_user=media'
sysrc 'emby_server_group=media'
sysrc 'emby_server_data_dir=/var/db/emby-server'
{%endace%}

Start the emby service.

{%ace lang='sh'%}
service emby-server start
{%endace%}

## Deluge

Setup of a jail for deluge server.

### FreeNAS Configuration

#### User

Use the media user from FreeNAS, It's important to check the UID and GID match up with the user's for any datasets shared with the jail. I have found the media user is usually already correctly matched.

Create a dataset for deluge and mount to your desired location inside the jail. Mount the desired location inside the jail, I mounted mine to the ```${HOME}/.config``` directory of my deluge user.

### jail

The following sections were done inside the jail.

#### Install Deluge

Install ```deluge``` or ```deluge-cli``` depending on what you want installed. Since this is a headless server I'm only installing the CLI version.

{%ace lang='sh'%}
pkg update && pkg upgrade
pkg install deluge-cli
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

## Couchpotato

Install [couchpotato](https://couchpota.to/#freebsd) freebsd version from git.

### FreeNAS UI

Create database dataset couchpotato and mount to ```/var/db/couchpotato```.

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
cp couchpotato/init/freebsd /usr/local/etc/rc.d/couchpotato
chmod 555 /usr/local/etc/rc.d/couchpotato
{%endace%}

Read the options at the top of ```/usr/local/etc/rc.d/couchpotato```.

If not using the default install, specify options with startup flags.

{%ace lang='sh'%}
sysrc 'couchpotato_enable=YES'
sysrc 'couchpotato_user=media'
sysrc 'couchpotato_dir=/var/db/couchpotato'
{%endace%}

Finally, start couchpotato.

{%ace lang='sh'%}
service couchpotato start
{%endace%}

Restart the jail, open your browser and go to [http://server:5050/](http://server:5050/).

## Pod

### In Jail

Enter jail.

{%ace lang='sh'%}
jexec pod tcsh
{%endace%}

Update.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

### Requirements

{%ace lang='sh'%}
pkg install bash libxslt wget curl
{%endace%}

bash requires fdescfs(5) mounted on /dev/fd, add to boot tasks in FreeNAS UI.

{%ace lang='sh'%}
mount -t fdescfs fdesc /mnt/tank/jails/pod/dev/fd
{%endace%}

### Create User

Create user 'pod'.

{%ace lang='sh'%}
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
{%endace%}

### Install bashpod

Clone the script.

{%ace lang='sh'%}
su pod
cd /home/pod
git clone https://github.com/johnramsden/bashpod.git
{%endace%}

### FreeNAS Task

In order to run from FreeNAS, create a new task that runs the bashpod script.

{%ace lang='sh'%}
jexec -U pod pod /usr/local/bin/bash -c "/home/pod/bashpod/bashpod.sh"
{%endace%}

## Sabnzbd

## FreeNAS

Create dataset, mount at ```/var/db/sabnzbd```

### Jail

Enter jail.

{%ace lang='sh'%}
jexec sickrage tcsh
{%endace%}

Update and install sabnzbd.

{%ace lang='sh'%}
pkg update && pkg upgrade && pkg install sabnzbdplus
{%endace%}

{%ace lang='sh'%}
sysrc 'sabnzbd_enable=YES'
sysrc 'sabnzbd_user=media'
sysrc 'sabnzbd_group=media'
sysrc 'sabnzbd_conf_dir=/var/db/sabnzbd'
{%endace%}

Restart jail

Edit config in ````/var/db/sabnzbd````, change host to 0.0.0.0

## SickRage

### In Jail

Enter jail.

{%ace lang='sh'%}
jexec sickrage tcsh
{%endace%}

Update.

{%ace lang='sh'%}
pkg update && pkg upgrade
{%endace%}

Install requirements.

{%ace lang='sh'%}
pkg install py27-sqlite3
{%endace%}

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

## Syncthing

### Create User Syncthing

On FreeNAS with ID 983, nologin

### In Jail

Enter jail.

{%ace lang='sh'%}
jexec syncthing tcsh
{%endace%}

Update and install syncthing.

{%ace lang='sh'%}
pkg update && pkg upgrade && pkg install syncthing
{%endace%}

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
-->
