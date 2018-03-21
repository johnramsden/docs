---
title: Firejail
tags: [ archlinux, linux, firejail ]
---

Copy profile to ```.config/firejail/<program>```

{%ace edit=true, lang='sh'%}
cp /etc/firejail/wine.profile ~/.config/firejail/wine-diablo3.profile
{%endace%}

Edit defaults

{%ace edit=true, lang='sh'%}
nano ~/.config/firejail/wine-diablo3.profile
{%endace%}

Set environment variables:

{%ace edit=true, lang='sh'%}
env WINEPREFIX=${HOME}/.local/share/wine/diablo3
env WINEARCH=win32
{%endace%}

Launch, setup prefix.

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

{%ace edit=true, lang='sh'%}
firejail --profile=~/.config/firejail/wine-diablo3.profile winecfg
{%endace%}

Install requirements.

{%ace edit=true, lang='sh'%}
env WINEARCH=win32 WINEPREFIX=/home/john/.local/share/wine/diablo3 winetricks --unattended d3dx9 gdiplus msxml3 msxml4 msxml6 riched20 riched30 vcrun2010 vcrun2012 vcrun2015 corefonts tahoma
{%endace%}

Download battlenet installer.

{%ace edit=true, lang='sh'%}
wget --output-document="${HOME}/.local/share/wine/diablo3/Battle.net-Setup.exe" https://www.battle.net/download/getInstallerForGame\?os\=win\&version\=LIVE\&gameProgram\=BATTLENET_APP/Battle.net-Setup.exe
{%endace%}

Launch:

{%ace edit=true, lang='sh'%}
firejail --profile=~/.config/firejail/wine-diablo3.profile wine "${HOME}/.local/share/wine/diablo3/Battle.net-Setup.exe"
{%endace%}
