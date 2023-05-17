---
title: Common Applications
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications
tags: [ archlinux, linux, aur, postinstall ]
permalink: linux_archlinux_applications.html
toc: true
folder: linux/archlinux
---

## syncthing

Install syncthing.

{%ace lang='sh'%}
pacman -S syncthing
{%endace%}

Start user service.

{%ace lang='sh'%}
systemctl --user enable --now syncthing
{%endace%}

Increase max-user-watches.

{%ace lang='sh'%}
nano /etc/sysctl.d/40-max-user-watches.conf
{%endace%}

{%ace lang='sh'%}
fs.inotify.max_user_watches=524288
{%endace%}

## Onboard Virtual Keyboard

Install onboard.

{%ace lang='sh'%}
pacman -S onboard
{%endace%}

For secondary labels run.

{%ace lang='sh'%}
gsettings set org.onboard.keyboard show-secondary-labels true
{%endace%}

## Conky

Install conky.

{%ace lang='sh'%}
pacman -S conky
{%endace%}

I use a script with conky to check email with the perl```Mail::IMAPClient``` and ```IO::Socket::SSL```, on arch needs: [perl-mail-imapclient (AUR)](https://aur.archlinux.org/packages/perl-mail-imapclient/), and [perl-io-socket-ssl](https://www.archlinux.org/packages/extra/any/perl-io-socket-ssl/).

{%ace lang='sh'%}
pacman -S perl-io-socket-ssl
aursync --update --temp --chroot perl-mail-imapclient
{%endace%}

## Steam using Flatpak

Add flathub.

{%ace lang='sh'%}
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
{%endace%}

Install steam for user.

{%ace lang='sh'%}
flatpak install --user flathub com.valvesoftware.Steam
{%endace%}

Run Steam, data for flatpak will be in ```${HOME}/.var```.

{%ace lang='sh'%}
flatpak run com.valvesoftware.Steam
{%endace%}
