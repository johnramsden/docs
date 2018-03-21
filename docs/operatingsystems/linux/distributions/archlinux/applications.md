---
title: Common Applications
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications
tags: [ archlinux, linux, aur, postinstall ]
folder: linux/archlinux
---

## syncthing

Install syncthing and syncthing-inotify to look for file changes.

{%ace edit=true, lang='sh'%}
pacman -S syncthing syncthing-inotify

{%endace%}

Start user service.

{%ace edit=true, lang='sh'%}
systemctl --user enable --now syncthing
{%endace%}

Increase max-user-watches.

{%ace edit=true, lang='sh'%}
nano /etc/sysctl.d/40-max-user-watches.conf
{%endace%}

{%ace edit=true, lang='sh'%}
fs.inotify.max_user_watches=524288
{%endace%}

## Onboard Virtual Keyboard

Install onboard.

{%ace edit=true, lang='sh'%}
pacman -S onboard
{%endace%}

For secondary labels run.

{%ace edit=true, lang='sh'%}
gsettings set org.onboard.keyboard show-secondary-labels true
{%endace%}

## Conky

Install conky.

{%ace edit=true, lang='sh'%}
pacman -S conky
{%endace%}

I use a script with conky to check email with the perl```Mail::IMAPClient``` and ```IO::Socket::SSL```, on arch needs: [perl-mail-imapclient (AUR)](https://aur.archlinux.org/packages/perl-mail-imapclient/), and [perl-io-socket-ssl](https://www.archlinux.org/packages/extra/any/perl-io-socket-ssl/).

{%ace edit=true, lang='sh'%}
pacaur -S perl-mail-imapclient perl-io-socket-ssl
{%endace%}

## Steam using Flatpak

Add flathub.

{%ace edit=true, lang='sh'%}
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
{%endace%}

Install steam for user.

{%ace edit=true, lang='sh'%}
flatpak install --user flathub com.valvesoftware.Steam
{%endace%}

Run Steam, data for flatpak will be in ```${HOME}/.var```.

{%ace edit=true, lang='sh'%}
flatpak run com.valvesoftware.Steam
{%endace%}
