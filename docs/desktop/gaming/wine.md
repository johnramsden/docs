---
title: Gaming with Wine
sidebar: desktop_sidebar
hide_sidebar: false
category: [ desktop, gaming ]
keywords: wine, gaming
tags: [ wine, gaming ]
---

## Gaming with Wine

Install ```winetricks``` and ```wine-staging```

### Grim Dawn

Create individual bottle, enable ```staging -> CSMT```:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn winecfg
{%endace%}

Install requirements:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn winetricks vcrun2010 vcrun2012 xact xinput d3dx9
{%endace%}

Download Windows Installer and run:

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/grimdawn wine ${HOME}/.local/share/wine/grimdawn/drive_c/users/john/Downloads/SteamSetup.exe
{%endace%}
