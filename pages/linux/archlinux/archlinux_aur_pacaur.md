---
title: Setting up pacaur with the Arch User Repository
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur
tags: [ archlinux, linux, aur, postinstall ]
permalink: archlinux_aur_pacaur.html
toc: false
folder: linux/archlinux
---

While not actually part of the Arch Linux base, most people will use the arch user repository (AUR) on an arch system to install applications that are not in the main arch repo.

## AUR Managers

Since it's not possible to install packages out of the AUR with pacman in the regular way, [AUR managers](https://wiki.archlinux.org/index.php/AUR_helpers) have been developed to wrap the packaging systems in arch. These AUR managers let users install packages out of the AUR in a way that resembles using pacman. Some of the more popular AUR managers include [yaourt](https://github.com/archlinuxfr/yaourt), [pacaur](https://github.com/rmarquis/pacaur), and [packer](https://github.com/keenerd/packer).

### pacaur

My Aur manager of choice is ```pacaur``` due to several reasons.

*   It works in a way almost identical to pacman.
*   It lets you accept all the prompts at the beginning.
*   It assumes you know what you're doing.

#### Installing

Setting up ```pacaur``` on new system is fairly easy. It only requires one package not in the base repository: ```cower```.

Download ```cower``` using ```wget``` or ```curl``` and then install using ```makepkg```.

{% highlight shell %}
mkdir -p ~/Downloads/cower && cd ~/Downloads/cower
curl -O https://aur.archlinux.org/cgit/aur.git/snapshot/cower.tar.gz
tar -xvf cower.tar.gz && cd cower
gpg --recv-key 1EB2638FF56C0C53 && gpg --lsign 1EB2638FF56C0C53
makepkg -sic
{% endhighlight shell %}

Then do the same for ```pacaur```

{% highlight shell %}
mkdir ~/Downloads/pacaur && cd ~/Downloads/pacaur
curl -O https://aur.archlinux.org/cgit/aur.git/snapshot/pacaur.tar.gz
tar -xvf pacaur.tar.gz && cd pacaur && makepkg -sic
{% endhighlight shell %}
