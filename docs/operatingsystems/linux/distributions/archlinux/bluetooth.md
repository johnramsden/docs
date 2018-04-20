---
title: Bluetooth
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux, postinstall ]
---

# Bluetooth

Install ```bluez``` and ```bluez-utils```.

{%ace lang='sh'%}
pacman -S bluez bluez-utils
{%endace%}

Load bluetooth driver (may be already loaded).

{%ace lang='sh'%}
modprobe btusb
{%endace%}

Start, and enable the bluetooth unit

{%ace lang='sh'%}
systemctl enable --now bluetooth
{%endace%}

Add user(s) who will use bluetooth to ```lp``` group

{%ace lang='sh'%}
gpasswd -a ${USER} lp
{%endace%}
