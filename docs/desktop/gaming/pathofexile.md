
# Path of Exile

The following describes how to setup Path of Exile.

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

{%ace edit=true, lang='sh'%}
pacaur -S ttf-ms-fonts  ttf-tahoma
{%endace%}

To create a 32bit bottle use ```WINEARCH=win32```.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX==~/.local/share/wine/pathofexile winecfg
{%endace%}

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

## Tuning

Get videocard RAM:

```
echo $"VRAM: "$(($(grep -P -o -i "(?<=memory:).*(?=kbytes)" /var/log/Xorg.0.log) / 1024))$" Mb"
```

Set in regedit. Copy the number.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine regedit
{%endace%}

Go to ```HKEY_CURRENT_USER>Software>Wine```

*   Add key "Direct3D"
*   Add new string to Direct3D folder. Right click>New String, type "VideoMemorySize", add "VideoMemorySize" string, use video memory number

## With Installer

Install dependencies

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winetricks -q glsl=disabled directx9 usp10 msls31
{%endace%}

Download and execute installer.

{%ace edit=true, lang='sh'%}
cd ${HOME}/.local/share/wine/pathofexile
wget https://www.pathofexile.com/downloads/PathOfExileInstaller.exe
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine ${HOME}/.local/share/wine/pathofexile/PathOfExileInstaller.exe
{%endace%}

Run game launcher.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Grinding Gear Games/Path of Exile/PathOfExile.exe" dbox  -no-dwrite -noasync
{%endace%}

## With Steam - (Unsuccessful)

install Microsoft Visual C++ Runtime 2015 and if fonts above weren't installed, corefonts.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winetricks -q vcrun2015 riched20 usp10
{%endace%}

### Install Steam

Download steam to ```${HOME}/.local/share/wine/pathofexile``` and run steam.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  ${HOME}/.local/share/wine/pathofexile/SteamSetup.exe
{%endace%}

Then run:

{%ace edit=true, lang='sh'%}
env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Steam/Steam.exe" -no-cef-sandbox  -no-dwrite -noasync
{%endace%}

### Finishing Tasks

Startup steam.

{%ace edit=true, lang='sh'%}
env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Steam/Steam.exe" -no-cef-sandbox  -no-dwrite -noasync
{%endace%}

*   Create shortcut, icon can be found in ``${HOME}/.local/share/wine/pathofexile/drive_c/Program\ Files/Steam/steam/games`.

{%ace edit=true, lang='sh'%}
nano "${HOME}/.local/share/applications/Path of Exile.desktop"
{%endace%}

{%ace edit=true, lang='sh'%}
[Desktop Entry]
Comment[en_US]=
Comment=
Exec=env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX="/home/john/.local/share/wine/pathofexile" /usr/bin/wine "/home/john/.local/share/wine/pathofexile/drive_c/Program Files/Steam/steamapps/common/Path of Exile/PathOfExileSteam.exe" -no-cef-sandbox  -no-dwrite -noasync
GenericName[en_US]=
GenericName=
Icon=5CED_ccabb5a034c0e3ed54f9ce0e5def91302a492850.0
MimeType=
Name[en_US]=Path of Exile
Name=Path of Exile
Path=
StartupNotify=true
Terminal=true
TerminalOptions=
Type=Application
X-DBUS-ServiceName=
X-DBUS-StartupType=none
X-KDE-SubstituteUID=false
X-KDE-Username=
{%endace%}

*   Disable overlay.
*   Set back to windows 7, if steam needed again, set to xp.
