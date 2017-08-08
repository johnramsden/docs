---
title: Graphical Configuration
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur, dwm
tags: [ archlinux, linux, aur, postinstall ]
permalink: archlinux_graphical_configuration.html
toc: true
folder: linux/archlinux
---

Forst setup [xorg](https://wiki.archlinux.org/index.php/Xorg) and graphics.

## Graphics

Install graphics drivers, my main system is [nvidia](https://wiki.archlinux.org/index.php/NVIDIA).

{% highlight shell %}
pacman -S nvidia lib32-nvidia-utils
{% endhighlight shell %}

## Xorg

{% highlight shell %}
pacman -S xorg-server
{% endhighlight shell %}

Set dpi in ```~/.Xresources```, I use 192 for my 4k screen.

{% highlight shell %}
nano ~/.Xresources
{% endhighlight shell %}

{% highlight shell %}
Xft.dpi: 192
{% endhighlight shell %}

### Nvidia - Tearing Fix

My Nvidia card tears. This removes the tearing.

{% highlight shell %}
nano /etc/X11/xorg.conf.d/20-nvidia.conf
{% endhighlight shell %}

{% highlight shell %}
Section "Screen"
    Identifier     "Screen0"
    Option         "metamodes" "nvidia-auto-select +0+0 { ForceFullCompositionPipeline = On }"
    Option         "AllowIndirectGLXProtocol" "off"
    Option         "TripleBuffer" "on"
EndSection
{% endhighlight shell %}

## Setup a Window Manager or Desktop Environment

### KDE Plasma

Install [KDE Plasma](https://www.archlinux.org/groups/x86_64/plasma/) package as well as some [KDE meta-packages](https://www.archlinux.org/packages/?name=kde-applications-meta). I dont install ```kde-meta-kdeaccessibility```, ```kde-meta-kdeedu```, ```kde-meta-kdegames```, .```kde-meta-kdemultimedia```, ```kde-meta-kdepim```, ```kde-meta-kdesdk```, ```kde-meta-kdewebdev```.

Choose ```phonon-qt5-gstreamer```, ```libx264```, ```cronie```, ```phonon-qt4-gstreamer```.

{% highlight shell %}
pacman -S plasma kde-meta-kdeadmin kde-meta-kdebase kde-meta-kdegraphics kde-meta-kdenetwork kde-meta-kdeutils
{% endhighlight shell %}

I disable baloo since it seems to make my system chug.

{% highlight shell %}
balooctl disable
{% endhighlight shell %}

## Display Manager

I use sddm, simple and works well. For an onscreen keyboard install [qt5-virtualkeyboard](https://www.archlinux.org/packages/extra/x86_64/qt5-virtualkeyboard/).

{% highlight shell %}
pacman -S sddm
{% endhighlight shell %}

Setup config at ```/etc/sddm.conf```.

{% highlight shell %}
nano /etc/sddm.conf
{% endhighlight shell %}

Tell it to start a desktop file from ```/usr/share/xsessions/```, set dpi, and user.

{% highlight shell %}
# Set DPI based on display
ServerArguments=-nolisten tcp -dpi 192

# Name of session file for autologin session
Session=plasma.desktop

# Username for autologin session
User=john

# Current theme name
Current=breeze
{% endhighlight shell %}

Enable sddm.

{% highlight shell %}
systemctl enable sddm
{% endhighlight shell %}

Reboot into KDE!

## VNC

Can access current display or create new session.

### System

To access the entire system over vnc, install [tigervnc](https://www.archlinux.org/packages/?name=tigervnc).

Configure startup run ```vncserver```.

Setup a systemd unit to start vnc, note this connects to physical display, [other options]() are available.. Change user.

{% highlight shell %}
nano /etc/systemd/system/x0vncserver.service
{% endhighlight shell %}

{% highlight shell %}
[Unit]
Description=Remote desktop service (VNC)
After=syslog.target network.target

[Service]
Type=forking
User=john
ExecStart=/usr/bin/sh -c '/usr/bin/x0vncserver -display :0 -rfbport 5900 -passwordfile /home/john/.vnc/passwd &'

[Install]
WantedBy=multi-user.target
{% endhighlight shell %}

### New Session



## Fonts

Install [ttf-google-fonts-git (AUR)](https://aur.archlinux.org/packages/ttf-google-fonts-git/).
