---
title: Path of Exile
category: [ desktop, gaming ]
keywords: wine, gaming
tags: [ wine, gaming ]
---

# Path of Exile

The following describes how to setup Path of Exile.

Prerequisites (Arch only):

*   [Gaming with Wine](/operatingsystems/linux/distributions/archlinux/wine.html)

## Dataset

Create a ZFS dataset for wine bottle.

{%ace lang='sh'%}
zfs create -o mountpoint=legacy vault/sys/$(hostname)/home/john/local/share/wine
{%endace%}

Add to fstab:

{%ace lang='sh'%}
vault/sys/chin/home/john/local/share/wine  /home/john/.local/share/wine zfs       rw,relatime,xattr,noacl     0 0
{%endace%}

Mount it

{%ace lang='sh'%}
mkdir /home/john/.local/share/wine
mount -a
{%endace%}

## Configuration

Always use ```env WINEPREFIX=${HOME}/.local/share/wine/<wine bottle>``` when creating bottles. Otherwise wine defaults to ```~/.wine```.

Install dependencies:

{%ace lang='sh'%}
pacman -S mpg123 lib32-gst-plugins-base-libs pulseaudio-alsa lib32-libpulse lib32-alsa-plugins lib32-libldap lib32-openal
{%endace%}

{%ace lang='sh'%}
pacaur -S ttf-ms-fonts  ttf-tahoma
{%endace%}

To create a 32bit bottle use ```WINEARCH=win32```.

{%ace lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winecfg
{%endace%}

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

## Tuning

Get videocard RAM:

```
echo $"VRAM: "$(($(grep -P -o -i "(?<=memory:).*(?=kbytes)" /var/log/Xorg.0.log) / 1024))$" Mb"
```

Set in regedit. Copy the number.

{%ace lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine regedit
{%endace%}

Go to ```HKEY_CURRENT_USER>Software>Wine```

*   Add key "Direct3D"
*   Add new string to Direct3D folder. Right click>New String, type "VideoMemorySize", add "VideoMemorySize" string, use video memory number

## With Installer

Install dependencies

{%ace lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winetricks -q glsl=disabled directx9 usp10 msls31
{%endace%}

Download and execute installer.

{%ace lang='sh'%}
cd ${HOME}/.local/share/wine/pathofexile
wget https://www.pathofexile.com/downloads/PathOfExileInstaller.exe
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine ${HOME}/.local/share/wine/pathofexile/PathOfExileInstaller.exe
{%endace%}

Run game launcher.

{%ace lang='sh'%}
env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Grinding Gear Games/Path of Exile/PathOfExile.exe" dbox  -no-dwrite -noasync
{%endace%}
