---
title: Grim Dawn
category: [ desktop, gaming ]
keywords: wine, gaming
tags: [ wine, gaming ]
---

## Grim Dawn Using Wine

Install ```winetricks``` and ```wine-staging```

### Grim Dawn

Create individual bottle, enable ```staging -> CSMT```:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn winecfg
{%endace%}

Install requirements:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn winetricks \
    vcrun2010 vcrun2012 xact xinput d3dx9
{%endace%}

Download Windows Installer and run:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn wine \
    ${HOME}/.local/share/wine/grimdawn/drive_c/users/john/Downloads/SteamSetup.exe
{%endace%}

After installing, install Grim Dawn in steam. If errors occur with ```steamwebui```, run ```winecfg``` and set ONLY steam to run in XP mode. If errors stull occur use ```-no-cef-sandbox```.


Now grim dawn should start with:

{%ace edit=true, lang='sh'%}
env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn wine \
    "${HOME}/.local/share/wine/grimdawn/drive_c/Program Files/Steam/steamapps/common/Grim Dawn/Grim Dawn.exe" -no-cef-sandbox
{%endace%}

Create a desktop file in linux to start Grim Dawn.

{%ace edit=true, lang='sh'%}
nano "${HOME}/.local/share/applications/Grim Dawn.desktop"
{%endace%}

{%ace edit=true, lang='sh'%}
[Desktop Entry]
Exec=env WINEDEBUG=-all WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn wine "${HOME}/.local/share/wine/grimdawn/drive_c/Program Files/Steam/steamapps/common/Grim Dawn/Grim Dawn.exe" -no-cef-sandbox
GenericName=Dark fantasy ARPG with fast paced combat and massive exploration.
Icon=${HOME}/.local/share/wine/grimdawn/drive_c/Program Files/Steam/steam/games/889a02bbebe088f7bd4f011ae641732481b1b3d6.ico
Name=Grim Dawn
NoDisplay=false
Path[$e]=
StartupNotify=true
Terminal=0
{%endace%}
