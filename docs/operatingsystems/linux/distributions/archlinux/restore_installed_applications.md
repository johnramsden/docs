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

{%ace edit=true, lang='sh'%}
pacman -Qqe > pkglist.txt
{%endace%}

### Regular repo

Remove AUR packages from explicitly installed package list, and save to file ```native.txt```.

{%ace edit=true, lang='sh'%}
bash -c "comm -12 <(pacman -Slq | sort) <(sort pkglist.txt)"  > native.txt
{%endace%}

Install them on new system after selecting wanted packages.

{%ace edit=true, lang='sh'%}
pacman  -S - < native.txt
{%endace%}

### AUR

List aur packages. Dont forget to edit.

{%ace edit=true, lang='sh'%}
pacman -Qmq > aur.txt
{%endace%}

On new system, install.

{%ace edit=true, lang='sh'%}
pacaur -S - < aur.txt
{%endace%}
