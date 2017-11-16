---
title: Bluetooth
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux, postinstall ]
---

# Bluetooth

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
