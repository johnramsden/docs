---
title: Wine Gaming
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications, gaming
tags: [ archlinux, linux, aur, postinstall ]
permalink: linux_archlinux_wine_gaming.html
toc: true
folder: linux/archlinux
---

## Setup

Install wine staging for much better performance.

Optionally install [wine-mono](https://www.archlinux.org/packages/?name=wine_gecko) and [wine_gecko](https://www.archlinux.org/packages/?name=wine-mono) see [wiki](https://wiki.archlinux.org/index.php/Wine#Installation) for info.

{% highlight shell %}
pacman -S wine-staging wine-mono wine_gecko
{% endhighlight shell %}

### Wine file associations

To avoid having [wine file associations](https://wiki.archlinux.org/index.php/Wine#Unregister_existing_Wine_file_associations) unregister them.

To prevent them set environment variable ```WINEDLLOVERRIDES```.

{% highlight shell %}
export WINEDLLOVERRIDES="winemenubuilder.exe=d"
{% endhighlight shell %}

## Dataset

Create a ZFS dataset for wine

zfs create -o mountpoint=legacy vault/sys/chin/home/john/local/share/wine

Add to fstab:

{% highlight shell %}
vault/sys/chin/home/john/local/share/wine  /home/john/.local/share/wine zfs       rw,relatime,xattr,noacl     0 0
{% endhighlight shell %}

Mount it

{% highlight shell %}
mkdir /home/john/.local/share/wine
mount -a
{% endhighlight shell %}

## Configuration

Always use ```env WINEPREFIX==~/.local/share/wine/<wine bottle>``` when creating bottles. Otherwise wine defaults to ```~/.wine```.

Install dependencies:

{% highlight shell %}
pacman -S mpg123 lib32-gst-plugins-base-libs
{% endhighlight shell %}

{% highlight shell %}
pacaur -S ttf-ms-fonts  ttf-tahoma
{% endhighlight shell %}

To create a 32bit bottle use ```WINEARCH=win32```.

{% highlight shell %}
env WINEARCH=win32 WINEPREFIX==~/.local/share/wine/pathofexile winecfg
{% endhighlight shell %}

Enable CSMT, optionallenable emulate virtual desktop and change DPI.

install Microsoft Visual C++ Runtime 2015 and if fonts above weren't installed, corefonts.

{% highlight shell %}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile winetricks -q vcrun2015 riched20 usp10
{% endhighlight shell %}

Download steam to ```${HOME}/.local/share/wine/pathofexile``` and run steam.

{% highlight shell %}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  ${HOME}/.local/share/wine/pathofexile/SteamSetup.exe
{% endhighlight shell %}

Then run:

{% highlight shell %}
env WINEARCH=win32 WINEPREFIX=${HOME}/.local/share/wine/pathofexile wine  "${HOME}/.local/share/wine/pathofexile/drive_c/Program Files/Steam/Steam.exe" -no-cef-sandbox  -no-dwrite
{% endhighlight shell %}
