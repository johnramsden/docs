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

{% highlight shell %}
pacman -S bluez bluez-utils
{% endhighlight shell %}

Load bluetooth driver (may be already loaded).

{% highlight shell %}
modprobe btusb
{% endhighlight shell %}

Start, and enable the bluetooth unit

{% highlight shell %}
systemctl enable --now bluetooth
{% endhighlight shell %}

Add user(s) who will use bluetooth to ```lp``` group

{% highlight shell %}
gpasswd -a ${USER} lp
{% endhighlight shell %}
