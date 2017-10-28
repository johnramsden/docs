---
title: Wine Gaming
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications, gaming
tags: [ archlinux, linux, aur, postinstall ]
permalink: linux_archlinux_wine_gaming.html
toc: true
folder: linux/archlinux
---

## Setup

Install wine staging for much better performance.

Optionally install [wine-mono](https://www.archlinux.org/packages/?name=wine_gecko) and [wine_gecko](https://www.archlinux.org/packages/?name=wine-mono) see [wiki](https://wiki.archlinux.org/index.php/Wine#Installation) for info.

{%ace edit=true, lang='sh'%}
pacman -S wine-staging wine-mono wine_gecko
{%endace%}

### Wine file associations

To avoid having [wine file associations](https://wiki.archlinux.org/index.php/Wine#Unregister_existing_Wine_file_associations) unregister them.

To prevent them set environment variable ```WINEDLLOVERRIDES```.

{%ace edit=true, lang='sh'%}
export WINEDLLOVERRIDES="winemenubuilder.exe=d"
{%endace%}

## Dataset

Create a ZFS dataset for wine

zfs create -o mountpoint=legacy vault/sys/chin/home/john/local/share/wine

Add to fstab:

{%ace edit=true, lang='sh'%}
vault/sys/chin/home/john/local/share/wine  /home/john/.local/share/wine zfs       rw,relatime,xattr,noacl     0 0
{%endace%}

Mount it

{%ace edit=true, lang='sh'%}
mkdir /home/john/.local/share/wine
mount -a
{%endace%}

## Configuration

Always use ```env WINEPREFIX==~/.local/share/wine/<wine bottle>``` when creating bottles. Otherwise wine defaults to ```~/.wine```.

Install dependencies:

{%ace edit=true, lang='sh'%}
pacman -S mpg123 lib32-gst-plugins-base-libs
{%endace%}

{%ace edit=true, lang='sh'%}
pacaur -S ttf-ms-fonts  ttf-tahoma
{%endace%}

To create a 32bit bottle use ```WINEARCH=win32```.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX==~/.local/share/wine/pathofexile winecfg
{%endace%}

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

install Microsoft Visual C++ Runtime 2015 and if fonts above weren't installed, corefonts.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winetricks -q vcrun2015 riched20 usp10
{%endace%}

Download steam to ```${HOME}/.local/share/wine/pathofexile``` and run steam.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  ${HOME}/.local/share/wine/pathofexile/SteamSetup.exe
{%endace%}

Then run:

{%ace edit=true, lang='sh'%}
env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Steam/Steam.exe" -no-cef-sandbox  -no-dwrite -noasync
{%endace%}

Get videocard RAM:

{%ace edit=true, lang='sh'%}
echo $"VRAM: "$(($(grep -P -o -i "(?<=memory:).*(?=kbytes)" /var/log/Xorg.0.log) / 1024))$" Mb"
{%endace%}

Set in regedit. Copy the number.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine regedit
{%endace%}

Go to HKEY_CURRENT_USER>Software>Wine
In wine folder add key "Direct3D", click add new string to Direct3D folder. Right click>New String, type "VideoMemorySize", add "VideoMemorySize" string, use video memory number

Create shortcut, and disable overlay. Set back to windows 7, if steam needed again, set to xp.
