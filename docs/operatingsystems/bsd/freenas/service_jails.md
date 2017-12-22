---
title: FreeNAS Service jails
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, deluge, sickrage, sabnzbd, emby, couchpotato, syncthing
tags: [ freebsd, bsd, jail ]
---

# FreeNAS Service jails

Manual setup of various services in FreeNAS jails. I have found manually set up services to be much more reliable then using FreeNAS' built in plugins.

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

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install deluge-cli
{%endace%}

#### Init Script

Setup ```/etc/rc.conf```

{%ace edit=true, lang='sh'%}
sysrc 'deluged_enable=YES' 'deluged_user=media'
{%endace%}

#### Start Service

{%ace edit=true, lang='sh'%}
service deluged start
{%endace%}

## Couchpotato

Install [couchpotato](https://couchpota.to/#freebsd) freebsd version from git.

### FreeNAS UI

Create database dataset couchpotato and mount to ```/var/db/couchpotato```.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
{%endace%}

Install required tools

{%ace edit=true, lang='sh'%}
pkg install python py27-sqlite3 fpc-libcurl docbook-xml git-lite
{%endace%}

Use user media, clone to a temp repo in ```/var/db```.

{%ace edit=true, lang='sh'%}
cd /var/db
git clone https://github.com/CouchPotato/CouchPotatoServer.git temp
{%endace%}

Move the bare repo that was just cloned to the dataset we mounted earlier to ```/var/db/couchpotato```.

{%ace edit=true, lang='sh'%}
mv temp/.git couchpotato/
rm -rf temp
{%endace%}

Switch to the ```media``` user and reset the repo to HEAD.

{%ace edit=true, lang='sh'%}
su media
cd couchpotato
git reset --hard HEAD
exit
{%endace%}

As root, copy the startup script to ```/usr/local/etc/rc.d``` and make the startup script executable.

{%ace edit=true, lang='sh'%}
cp couchpotato/init/freebsd /usr/local/etc/rc.d/couchpotato
chmod 555 /usr/local/etc/rc.d/couchpotato
{%endace%}

Read the options at the top of ```/usr/local/etc/rc.d/couchpotato```.

If not using the default install, specify options with startup flags.

{%ace edit=true, lang='sh'%}
sysrc 'couchpotato_enable=YES'
sysrc 'couchpotato_user=media'
sysrc 'couchpotato_dir=/var/db/couchpotato'
{%endace%}

Finally, start couchpotato.

{%ace edit=true, lang='sh'%}
service couchpotato start
{%endace%}

Restart the jail, open your browser and go to [http://server:5050/](http://server:5050/).

## Emby

### FreeNAS

Create dataset, mount at ```/var/db/emby```

### Jail

In the jail, update all packages and install ```emby-server```.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install emby-server
{%endace%}

### FFMpeg

It's recommended to install ffmpeg from ports so that certain compile time options can be enabled.

Update the FreeBSD ports tree

{%ace edit=true, lang='sh'%}
portsnap fetch extract update
{%endace%}

Remove the default ffmpeg package

{%ace edit=true, lang='sh'%}
pkg delete -f ffmpeg
{%endace%}

Reinstall FFMpeg from ports with lame option enabled

{%ace edit=true, lang='sh'%}
cd /usr/ports/multimedia/ffmpeg && make config
{%endace%}

*   enable the lame option
*   enable the ass subtitles option
*   enable the opus subtitles option
*   enable the x265 subtitles option

Compile and install.

{%ace edit=true, lang='sh'%}
make install clean
{%endace%}

### ImageMagick

It is recommended to recompile the graphics/ImageMagick package from ports with the following options .

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)

Delete the imagemagick pkg.

{%ace edit=true, lang='sh'%}
pkg delete -f imagemagick
{%endace%}

Install from ports

{%ace edit=true, lang='sh'%}
cd /usr/ports/graphics/ImageMagick && make config
{%endace%}

*   Disable the 16BIT_PIXEL option

{%ace edit=true, lang='sh'%}
make install clean
{%endace%}

## Emby Start Options

Set the rc script executable.

{%ace edit=true, lang='sh'%}
chmod 555 /usr/local/etc/rc.d/emby-server
{%endace%}

Check the options.

{%ace edit=true, lang='sh'%}
less /usr/local/etc/rc.d/emby-server
{%endace%}

Set emby to start on boot and change the options based on setup.

{%ace edit=true, lang='sh'%}
sysrc 'emby_server_enable=YES'
sysrc 'emby_server_user=media'
sysrc 'emby_server_group=media'
sysrc 'emby_server_data_dir=/var/db/emby-server'
{%endace%}

Start the emby service.

{%ace edit=true, lang='sh'%}
service emby-server start
{%endace%}

## Pod

### In Jail

Enter jail.

{%ace edit=true, lang='sh'%}
jexec pod tcsh
{%endace%}

Update.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
{%endace%}

### Requirements

{%ace edit=true, lang='sh'%}
pkg install bash libxslt wget curl
{%endace%}

bash requires fdescfs(5) mounted on /dev/fd, add to boot tasks in FreeNAS UI.

{%ace edit=true, lang='sh'%}
mount -t fdescfs fdesc /mnt/tank/jails/pod/dev/fd
{%endace%}

### Create User

Create user 'pod'.

{%ace edit=true, lang='sh'%}
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

{%ace edit=true, lang='sh'%}
su pod
cd /home/pod
git clone https://github.com/johnramsden/bashpod.git
{%endace%}

### FreeNAS Task

In order to run from FreeNAS, create a new task that runs the bashpod script.

{%ace edit=true, lang='sh'%}
jexec -U pod pod /usr/local/bin/bash -c "/home/pod/bashpod/bashpod.sh"
{%endace%}

## Sabnzbd

## FreeNAS

Create dataset, mount at ```/var/db/sabnzbd```

### Jail

Enter jail.

{%ace edit=true, lang='sh'%}
jexec sickrage tcsh
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

## SickRage

### In Jail

Enter jail.

{%ace edit=true, lang='sh'%}
jexec sickrage tcsh
{%endace%}

Update.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
{%endace%}

Install requirements.

{%ace edit=true, lang='sh'%}
pkg install py27-sqlite3
{%endace%}

Install SickRage.

{%ace edit=true, lang='sh'%}
cd /var/db
git clone  https://github.com/SickRage/SickRage.git temp
mv temp/.git sickrage/
rm -rf temp
chown -R media:media sickrage/
su media
cd sickrage/
git reset --hard HEAD
ls runscripts/
{%endace%}

Copy the startup script

{%ace edit=true, lang='sh'%}
cp /var/db/sickrage/runscripts/init.freebsd /usr/local/etc/rc.d/sickrage
{%endace%}

Make startup script executable

{%ace edit=true, lang='sh'%}
chmod 555 /usr/local/etc/rc.d/sickrage
{%endace%}

Add settings to rc.conf

{%ace edit=true, lang='sh'%}
sysrc 'sickrage_enable=YES'
sysrc 'sickrage_user=media'
sysrc 'sickrage_group=media'
sysrc 'sickrage_dir=/var/db/sickrage'
{%endace%}

Start SickRage.

{%ace edit=true, lang='sh'%}
service sickrage start
{%endace%}

## Syncthing

### Create User Syncthing

On FreeNAS with ID ```983```, ```nologin```

### In Jail

Enter jail.

{%ace edit=true, lang='sh'%}
jexec syncthing tcsh
{%endace%}

Update and install syncthing.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade && pkg install syncthing
{%endace%}

Add the following to ```rc.conf```:

{%ace edit=true, lang='sh'%}
sysrc 'syncthing_enable=YES'
sysrc 'syncthing_user=syncthing'
sysrc 'syncthing_group=syncthing'
sysrc 'syncthing_dir=/var/db/syncthing'
{%endace%}

### Configure

Start syncthing as an initial test:

service syncthing start

Edit vim ```/var/db/syncthing/config.xml``` and change the IP address which the GUI will be accessible from. This will enable accessing the GUI from a remote computer:

Before:

{%ace edit=true, lang='xml'%}
<gui enabled="true" tls="false">
 <address>127.0.0.1:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
{%endace%}

After:

{%ace edit=true, lang='xml' %}
<gui enabled="true" tls="false">
 <address>0.0.0.0:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
{%endace%}

Restart the service for changes to apply:

{%ace edit=true, lang='sh'%}
service syncthing restart
{%endace%}

Finally, access the GUI by pointing a browser to the server's address and port, ie ```http://SERVER_URL:8384```.
