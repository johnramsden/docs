---
title: Graphical Configuration
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, dwm
tags: [ archlinux, linux, aur, postinstall ]
permalink: linux_archlinux_graphical_configuration.html
toc: true
folder: linux/archlinux
---

First setup [xorg](https://wiki.archlinux.org/index.php/Xorg) and graphics.

## Graphics

Install graphics drivers, my main system is [nvidia](https://wiki.archlinux.org/index.php/NVIDIA).

{%ace lang='sh'%}
pacman -S nvidia lib32-nvidia-utils
{%endace%}

## Xorg

{%ace lang='sh'%}
pacman -S xorg-server
{%endace%}

Set dpi in ```~/.Xresources```, I use 192 for my 4k screen.

{%ace lang='sh'%}
nano ~/.Xresources
{%endace%}

{%ace lang='sh'%}
Xft.dpi: 192
{%endace%}

### Nvidia - Tearing Fix

My Nvidia card tears. This removes the tearing.

#### Desktop

{%ace lang='sh'%}
nano /etc/X11/xorg.conf.d/20-nvidia.conf
{%endace%}

{%ace lang='sh'%}
Section "Screen"
    Identifier     "Screen0"
    Option         "metamodes" "nvidia-auto-select +0+0 { ForceFullCompositionPipeline = On }"
    Option         "AllowIndirectGLXProtocol" "off"
    Option         "TripleBuffer" "on"
EndSection
{%endace%}

#### Laptop

To fix laptop using [DRM kernel mode setting](https://wiki.archlinux.org/index.php/NVIDIA#DRM_kernel_mode_setting).

[nvidia](https://www.archlinux.org/packages/?name=nvidia) 364.16 adds support for DRM kernel mode setting.

Add the ```nvidia-drm.modeset=1``` kernel parameter, and add ```nvidia```, ```nvidia_modeset```, ```nvidia_uvm``` and ```nvidia_drm``` to mkinitcpio modules.

##### Pacman hook

To update initramfs after an NVIDIA driver upgrade, use a pacman hook:

{%ace lang='sh'%}
/etc/pacman.d/hooks/nvidia.hook
{%endace%}

{%ace lang='sh'%}
[Trigger]
Operation=Install
Operation=Upgrade
Operation=Remove
Type=Package
Target=nvidia

[Action]
Depends=mkinitcpio
When=PostTransaction
Exec=/usr/bin/mkinitcpio -P
{%endace%}

## Setup a Window Manager or Desktop Environment

### KDE Plasma

Install [KDE Plasma](https://www.archlinux.org/groups/x86_64/plasma/) package as well as some [KDE meta-packages](https://www.archlinux.org/packages/?name=kde-applications-meta). I dont install ```kde-meta-kdeaccessibility```, ```kde-meta-kdeedu```, ```kde-meta-kdegames```, .```kde-meta-kdemultimedia```, ```kde-meta-kdepim```, ```kde-meta-kdesdk```, ```kde-meta-kdewebdev```.

Choose ```phonon-qt5-gstreamer```, ```libx264```, ```cronie```, ```phonon-qt4-gstreamer```.

{%ace lang='sh'%}
pacman -S plasma kde-meta-kdeadmin kde-meta-kdebase kde-meta-kdegraphics kde-meta-kdenetwork kde-meta-kdeutils
{%endace%}

I disable baloo since it seems to make my system chug.

{%ace lang='sh'%}
balooctl disable
{%endace%}

## Display Manager

I use sddm, simple and works well. For an onscreen keyboard install [qt5-virtualkeyboard](https://www.archlinux.org/packages/extra/x86_64/qt5-virtualkeyboard/).

{%ace lang='sh'%}
pacman -S sddm
{%endace%}

Setup config at ```/etc/sddm.conf```.

{%ace lang='sh'%}
nano /etc/sddm.conf
{%endace%}

Tell it to start a desktop file from ```/usr/share/xsessions/```, set dpi, and user.

{%ace lang='sh'%}
# Set DPI based on display
ServerArguments=-nolisten tcp -dpi 192

# Name of session file for autologin session
Session=plasma.desktop

# Username for autologin session
User=john

# Current theme name
Current=breeze
{%endace%}

Enable sddm.

{%ace lang='sh'%}
systemctl enable sddm
{%endace%}

Reboot into KDE!

## VNC

Can access current display or create new session.

### System

To access the entire system over vnc, install [tigervnc](https://www.archlinux.org/packages/?name=tigervnc).

Configure startup run ```vncserver```.

Setup a systemd unit to start vnc, note this connects to physical display, [other options]() are available.. Change user.

{%ace lang='sh'%}
nano /etc/systemd/system/x0vncserver.service
{%endace%}

{%ace lang='sh'%}
[Unit]
Description=Remote desktop service (VNC)
After=syslog.target network.target

[Service]
Type=forking
User=john
ExecStart=/usr/bin/sh -c '/usr/bin/x0vncserver -display :0 -rfbport 5900 -passwordfile /home/john/.vnc/passwd &'

[Install]
WantedBy=multi-user.target
{%endace%}

{%ace lang='sh'%}
systemctl start x0vncserver
{%endace%}

## Fonts

Install [ttf-google-fonts-git (AUR)](https://aur.archlinux.org/packages/ttf-google-fonts-git/).

{%ace lang='sh'%}
pacaur -S ttf-google-fonts-git
{%endace%}
