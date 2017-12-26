---
title: emby jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, emby
tags: [ freebsd, bsd, jail ]
---

## emby jail

Create jail

{%ace edit=true, lang='sh'%}
iocage create -r 11.0-RELEASE tag=emby ip4_addr="igb1|170.20.40.36/24" jail_zfs=on vnet=off
{%endace%}

{%ace edit=true, lang='sh'%}
iocage set vnet=off emby
iocage set ip4_addr="igb0|170.20.40.66/24" emby
iocage set resolver=none emby
{%endace%}

Start jail and enter.

{%ace edit=true, lang='sh'%}
iocage start emby
iocage console emby
{%endace%}

### FreeNAS

Create dataset, mount at ```/var/db/emby```

### Jail

In the jail, update all packages and install ```emby-server```.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install emby-server
{%endace%}

#### FFMpeg

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

#### ImageMagick

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

### Emby Start Options

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
