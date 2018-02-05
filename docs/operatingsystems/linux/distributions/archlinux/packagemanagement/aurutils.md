---
title: aurutils
tags: [ archlinux, linux ]
---

# aurutils

[Aurutils](https://github.com/AladW/aurutils) is an AUR helper.

>   aurutils is a collection of scripts to automate usage of the Arch User Repository, with different tasks such as package searching, update checks, or computing dependencies kept separate.
>
>  The chosen approach for managing packages is local pacman   repositories, rather than foreign (installed by "pacman -U")   packages.

## Install

Install from [aur package](https://aur.archlinux.org/packages/aurutils).

[Add](https://wiki.archlinux.org/index.php/Pacman/Package_signing#Adding_unofficial_keys) developer key.

{%ace edit=true, lang='sh'%}
$ gpg --recv-key 6BC26A17B9B7018A && gpg --lsign 6BC26A17B9B7018A
{%endace%}

Optional dependencies:

*   aria2 (aria2-fast, aria2-git) (optional) – threaded downloads
*   devtools (devtools-git, devtools32-git) (optional) – systemd-nspawn support
*   expac (expac-git) (optional) – aursift script
*   parallel (parallel-rust) (optional) – threaded downloads
*   repose (repose-git) (optional) – repo-add alternative
*   vifm (vifm-git) (optional) – build file interaction

I started with `aurutils devtools parallel vifm`.

## Setup

Create a local repository config.
*Adapted from man page*

{%ace edit=true, lang='sh'%}
[root]# nano /etc/pacman.d/custom
{%endace%}

{%ace edit=true, lang='sh'%}
[options]
CacheDir = /var/cache/pacman/pkg
CacheDir = /var/cache/pacman/custom
CleanMethod = KeepCurrent

[custom]
SigLevel = Optional TrustAll
Server = file:///var/cache/pacman/custom
{%endace%}

Add config to the end of `/etc/pacman.conf`.

{%ace edit=true, lang='sh'%}
[root]# nano /etc/pacman.conf
{%endace%}

{%ace edit=true, lang='sh'%}
Include = /etc/pacman.d/custom
{%endace%}

Create repository root and database:

{%ace edit=true, lang='sh'%}
$ sudo install -d /var/cache/pacman/custom -o $USER
$ repo-add /var/cache/pacman/custom/custom.db.tar
{%endace%}

Sync repo.

{%ace edit=true, lang='sh'%}
[root]# pacman -Syu
{%endace%}

## Build in chroot

It's possible to build in a clean chroot (actually using systemd-nspawn container) with `makechrootpkg`.

To install a package to the container use ```pacman --root=/var/lib/aurbuild/x86_64/root -S zfs-linux```.

### Setup Container

I set up a aurbuild root to be zfs dataset (optional). Could also use btrfs.

{%ace edit=true, lang='sh'%}
[root]# zfs create <system root>/var/lib/aurbuild -o mountpoint=legacy
[root]# mkdir /var/lib/aurbuild
[root]# mount -t zfs <system root>/var/lib/aurbuild /var/lib/aurbuild
{%endace%}

Add to fstab.

## Usage

To get a list of all current existing AUR packages  so that they can be migrated to `aurutils`, run `pacman -Qmq`.

Attempt a build in a clean chroot of `google-chrome`.

{%ace edit=true, lang='sh'%}
aursync -c google-chrome
{%endace%}

Now it can be installed with `pacman -S google-chrome`.
