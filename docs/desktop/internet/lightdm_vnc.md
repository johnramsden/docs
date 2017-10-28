---
title: Lightdm VNC Connection with Password
sidebar: desktop_sidebar
hide_sidebar: false
category: [ desktop, desktop-internet ]
keywords: vnc, authenticate
tags: [ network ]
permalink: desktop_internet_lightdm_vnc.html
toc: true
folder: desktop/internet
---

To connect to a session being started with lightdm, install a vnc server such as tightvnc.

Run ```vncpasswd``` as the user who will connect.

Add the following to ```/etc/lightdm/lightdm.conf```. Where ```john``` is replaced by the user.

{%ace edit=true, lang='sh'%}
[VNCServer]
command=/usr/bin/Xvnc -rfbauth /home/john/.vnc/passwd
enabled=true
port=5900
width=1920
height=1080
depth=16
{%endace%}
