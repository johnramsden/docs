---
title: Wine Gaming
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, applications, gaming
tags: [ archlinux, linux, aur, postinstall ]
---

# Wine Gaming

This post describes setting up wine for use on Arch Linux.

## Setup

Install wine staging for much better performance.

Optionally install [wine-mono](https://www.archlinux.org/packages/?name=wine_gecko) and [wine_gecko](https://www.archlinux.org/packages/?name=wine-mono) see [wiki](https://wiki.archlinux.org/index.php/Wine#Installation) for info.

{%ace lang='sh'%}
pacman -S wine-staging wine-mono wine_gecko
{%endace%}

### Wine file associations

To avoid having [wine file associations](https://wiki.archlinux.org/index.php/Wine#Unregister_existing_Wine_file_associations) unregister them.

To prevent them set environment variable ```WINEDLLOVERRIDES```.

{%ace lang='sh'%}
export WINEDLLOVERRIDES="winemenubuilder.exe=d"
{%endace%}
