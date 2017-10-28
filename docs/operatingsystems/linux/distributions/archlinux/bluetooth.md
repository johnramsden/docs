---
title: Bluetooth
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux, postinstall ]
permalink: linux_archlinux_bluetooth.html
toc: true
folder: linux/archlinux
---

Install ```bluez``` and ```bluez-utils```.

{%ace edit=true, lang='sh'%}
pacman -S bluez bluez-utils
{%endace%}

Load bluetooth driver (may be already loaded).

{%ace edit=true, lang='sh'%}
modprobe btusb
{%endace%}

Start, and enable the bluetooth unit

{%ace edit=true, lang='sh'%}
systemctl enable --now bluetooth
{%endace%}

Add user(s) who will use bluetooth to ```lp``` group

{%ace edit=true, lang='sh'%}
gpasswd -a ${USER} lp
{%endace%}
