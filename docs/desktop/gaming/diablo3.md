---
title: Diablo III
category: [ desktop, gaming ]
keywords: wine, gaming
tags: [ wine, gaming ]
---

# Diablo III

The following describes how to setup Diablo III.

Prerequisites (Arch only):

*   [Gaming with Wine](/operatingsystems/linux/distributions/archlinux/wine.html)

## Dataset

Create a ZFS dataset for wine bottle.

{%ace edit=true, lang='sh'%}
zfs create -o mountpoint=legacy vault/sys/$(hostname)/home/john/local/share/wine
{%endace%}

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

Always use ```env WINEPREFIX=${HOME}/.local/share/wine/<wine bottle>``` when creating bottles. Otherwise wine defaults to ```~/.wine```.

Install dependencies:

{%ace edit=true, lang='sh'%}
pacman -S mpg123 lib32-gst-plugins-base-libs pulseaudio-alsa lib32-libpulse lib32-alsa-plugins lib32-libldap
{%endace%}

Install fonts on system, or later in wine bottle.

{%ace edit=true, lang='sh'%}
pacaur -S ttf-ms-fonts  ttf-tahoma
{%endace%}

To create a 32bit bottle use ```WINEARCH=win32```.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 winecfg
{%endace%}

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

## Tuning

Get videocard RAM:

```
echo $"VRAM: "$(($(grep -P -o -i "(?<=memory:).*(?=kbytes)" /var/log/Xorg.0.log) / 1024))$" Mb"
```

Set in regedit. Copy the number.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 wine regedit
{%endace%}

Go to ```HKEY_CURRENT_USER>Software>Wine```

*   Add key "Direct3D"
*   Add new string to Direct3D folder. Right click>New String, type "VideoMemorySize", add "VideoMemorySize" string, use video memory number

## With Installer

Install dependencies, dont install tahoma if it was already installed on system.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 winetricks --unattended d3dx9 gdiplus msxml3 msxml4 msxml6 riched20 riched30 vcrun2010 vcrun2012 vcrun2015 corefonts
{%endace%}

Download Battle.net installer.

{%ace edit=true, lang='sh'%}
wget --output-document="${HOME}/.local/share/wine/diablo3/Battle.net-Setup.exe" https://www.battle.net/download/getInstallerForGame\?os\=win\&version\=LIVE\&gameProgram\=BATTLENET_APP/Battle.net-Setup.exe
{%endace%}

Run installer

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 wine "${HOME}/.local/share/wine/diablo3/Battle.net-Setup.exe"
{%endace%}

Run Battle.net

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 wine "${HOME}/.local/share/wine/diablo3/drive_c/Program Files/Battle.net/Battle.net.exe"
{%endace%}

### Finishing Tasks

*   Create shortcut.

{%ace edit=true, lang='sh'%}
nano "${HOME}/.local/share/applications/Diablo III.desktop"
{%endace%}

{%ace edit=true, lang='sh'%}
[Desktop Entry]
Comment[en_US]=
Comment=
Exec=env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/diablo3 wine "${HOME}/.local/share/wine/diablo3/drive_c/Program Files/Battle.net/Battle.net.exe"
GenericName[en_US]=
GenericName=
Icon=
MimeType=
Name[en_US]=Diablo III
Name=Diablo III
Path=
StartupNotify=true
Terminal=true
TerminalOptions=
Type=Application
{%endace%}
