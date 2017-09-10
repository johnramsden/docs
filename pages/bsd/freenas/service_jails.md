---
title: FreeNAS Service jails
sidebar: bsd_sidebar
hide_sidebar: false
keywords: freebsd, bsd, freenas, jail, deluge, sickrage, sabnzbd, emby, couchpotato, syncthing
tags: [ freebsd, bsd, jail ]
permalink: bsd_freenas_service_jails.html
toc: true
folder: bsd/freenas
---

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

{% highlight shell %}
pkg update && pkg upgrade
pkg install deluge-cli
{% endhighlight shell %}

#### Init Script

Setup ```/etc/rc.conf```

{% highlight shell %}
sysrc 'deluged_enable=YES' 'deluged_user=media'
{% endhighlight shell %}

#### Start Service

{% highlight shell %}
service deluged start
{% endhighlight shell %}

## Couchpotato

Install [couchpotato](https://couchpota.to/#freebsd) freebsd version from git.

### FreeNAS UI

Create database dataset couchpotato and mount to ```/var/db/couchpotato```.

{% highlight shell %}
pkg update && pkg upgrade
{% endhighlight shell %}

Install required tools

{% highlight shell %}
pkg install python py27-sqlite3 fpc-libcurl docbook-xml git-lite
{% endhighlight shell %}

Use user media, clone to a temp repo in ```/var/db```.

{% highlight shell %}
cd /var/db
git clone https://github.com/CouchPotato/CouchPotatoServer.git temp
{% endhighlight shell %}

Move the bare repo that was just cloned to the dataset we mounted earlier to ```/var/db/couchpotato```.

{% highlight shell %}
mv temp/.git couchpotato/
rm -rf temp
{% endhighlight shell %}

Switch to the ```media``` user and reset the repo to HEAD.

{% highlight shell %}
su media
cd couchpotato
git reset --hard HEAD
exit
{% endhighlight shell %}

As root, copy the startup script to ```/usr/local/etc/rc.d``` and make the startup script executable.

{% highlight shell %}
cp couchpotato/init/freebsd /usr/local/etc/rc.d/couchpotato
chmod 555 /usr/local/etc/rc.d/couchpotato
{% endhighlight shell %}

Read the options at the top of ```/usr/local/etc/rc.d/couchpotato```.

If not using the default install, specify options with startup flags.

{% highlight shell %}
sysrc 'couchpotato_enable=YES'
sysrc 'couchpotato_user=media'
sysrc 'couchpotato_dir=/var/db/couchpotato'
{% endhighlight shell %}

Finally, start couchpotato.

{% highlight shell %}
service couchpotato start
{% endhighlight shell %}

Restart the jail, open your browser and go to [http://server:5050/](http://server:5050/).

## Emby

### FreeNAS

Create dataset, mount at ```/var/db/emby```

### Jail

In the jail, update all packages and install ```emby-server```.

{% highlight shell %}
pkg update && pkg upgrade
pkg install emby-server
{% endhighlight shell %}

### FFMpeg

It's recommended to install ffmpeg from ports so that surgeon compile time options can be enabled.

Update the FreeBSD ports tree

{% highlight shell %}
portsnap fetch extract update
{% endhighlight shell %}

Remove the default ffmpeg package

{% highlight shell %}
pkg delete -f ffmpeg
{% endhighlight shell %}

Reinstall FFMpeg from ports with lame option enabled

{% highlight shell %}
cd /usr/ports/multimedia/ffmpeg && make config
{% endhighlight shell %}

*   enable the lame option
*   enable the ass subtitles option
*   enable the opus subtitles option
*   enable the x265 subtitles option

Compile and install.

{% highlight shell %}
make install clean
{% endhighlight shell %}

### ImageMagick

It is recommended to recompile the graphics/ImageMagick package from ports with the following options .

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)

Delete the imagemagick pkg.

{% highlight shell %}
pkg delete -f imagemagick
{% endhighlight shell %}

Install from ports

{% highlight shell %}
cd /usr/ports/graphics/ImageMagick && make config
{% endhighlight shell %}

*   Disable the 16BIT_PIXEL option

{% highlight shell %}
make install clean
{% endhighlight shell %}

## Emby Start Options

Set the rc script executable.

{% highlight shell %}
chmod 555 /usr/local/etc/rc.d/emby-server
{% endhighlight shell %}

Check the options.

{% highlight shell %}
less /usr/local/etc/rc.d/emby-server
{% endhighlight shell %}

Set emby to start on boot and change the options based on setup.

{% highlight shell %}
sysrc 'emby_server_enable=YES'
sysrc 'emby_server_user=media'
sysrc 'emby_server_group=media'
sysrc 'emby_server_data_dir=/var/db/emby-server'
{% endhighlight shell %}

Start the emby service.

{% highlight shell %}
service emby-server start
{% endhighlight shell %}

## Pod

### In Jail

Enter jail.

{% highlight shell %}
jexec pod tcsh
{% endhighlight shell %}

Update.

{% highlight shell %}
pkg update && pkg upgrade
{% endhighlight shell %}

### Requirements

{% highlight shell %}
pkg install bash libxslt wget curl
{% endhighlight shell %}

bash requires fdescfs(5) mounted on /dev/fd, add to boot tasks in FreeNAS UI.

{% highlight shell %}
mount -t fdescfs fdesc /mnt/tank/jails/pod/dev/fd
{% endhighlight shell %}

### Create User

Create user 'pod'.

{% highlight shell %}
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
{% endhighlight shell %}

### Install bashpod

Clone the script.

{% highlight shell %}
su pod
cd /home/pod
git clone https://github.com/johnramsden/bashpod.git
{% endhighlight shell %}

### FreeNAS Task

In order to run from FreeNAS, create a new task that runs the bashpod script.

{% highlight shell %}
jexec -U pod pod /usr/local/bin/bash -c "/home/pod/bashpod/bashpod.sh"
{% endhighlight shell %}

## Sabnzbd

## FreeNAS

Create dataset, mount at ```/var/db/sabnzbd```

### Jail

Enter jail.

{% highlight shell %}
jexec sickrage tcsh
{% endhighlight shell %}

Update and install sabnzbd.

{% highlight shell %}
pkg update && pkg upgrade && pkg install sabnzbdplus
{% endhighlight shell %}

{% highlight shell %}
sysrc 'sabnzbd_enable=YES'
sysrc 'sabnzbd_user=media'
sysrc 'sabnzbd_group=media'
sysrc 'sabnzbd_conf_dir=/var/db/sabnzbd'
{% endhighlight shell %}

Restart jail

Edit config in ````/var/db/sabnzbd````, change host to 0.0.0.0

## SickRage

### In Jail

Enter jail.

{% highlight shell %}
jexec sickrage tcsh
{% endhighlight shell %}

Update.

{% highlight shell %}
pkg update && pkg upgrade
{% endhighlight shell %}

Install requirements.

{% highlight shell %}
pkg install py27-sqlite3
{% endhighlight shell %}

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

{% highlight shell %}
jexec syncthing tcsh
{% endhighlight shell %}

Update and install syncthing.

{% highlight shell %}
pkg update && pkg upgrade && pkg install syncthing
{% endhighlight shell %}

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
