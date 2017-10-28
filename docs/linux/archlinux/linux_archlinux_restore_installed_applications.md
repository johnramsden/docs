---
title: Restore Installed Applications
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications
tags: [ archlinux, linux, aur, postinstall ]
permalink: linux_archlinux_restore_installed_applications.html
toc: true
folder: linux/archlinux
---

## Restore Packages

To list explicitly installed packages.

{% highlight shell %}
pacman -Qqe > pkglist.txt
{% endhighlight shell %}

### Regular repo

Remove AUR packages from explicitly installed package list, and save to file ```native.txt```.

{% highlight shell %}
bash -c "comm -12 <(pacman -Slq | sort) <(sort pkglist.txt)"  > native.txt
{% endhighlight shell %}

Install them on new system after selecting wanted packages.

{% highlight shell %}
pacman  -S - < native.txt
{% endhighlight shell %}

### AUR

List aur packages. Dont forget to edit.

{% highlight shell %}
pacman -Qmq > aur.txt
{% endhighlight shell %}

On new system, install.

{% highlight shell %}
pacaur -S - < aur.txt
{% endhighlight shell %}
