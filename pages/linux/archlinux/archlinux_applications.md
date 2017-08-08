---
title: Graphical Configuration
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur, applications
tags: [ archlinux, linux, aur, postinstall ]
permalink: archlinux_graphical_configuration.html
toc: true
folder: linux/archlinux
---

## syncthing

Install syncthing and syncthing-inotify to look for file changes.

{% highlight shell %}
pacman -S syncthing syncthing-inotify

{% endhighlight shell %}

Start user service.

{% highlight shell %}
systemctl --user enable --now syncthing
{% endhighlight shell %}

Increase max-user-watches.

{% highlight shell %}
nano /etc/sysctl.d/40-max-user-watches.conf
{% endhighlight shell %}

{% highlight shell %}
fs.inotify.max_user_watches=524288
{% endhighlight shell %}

## Onboard Virtual Keyboard

For secondary labels run.

{% highlight shell %}
gsettings set org.onboard.keyboard show-secondary-labels true
{% endhighlight shell %}
