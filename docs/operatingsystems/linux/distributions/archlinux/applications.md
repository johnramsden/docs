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

Install onboard.

{% highlight shell %}
pacman -S onboard
{% endhighlight shell %}

For secondary labels run.

{% highlight shell %}
gsettings set org.onboard.keyboard show-secondary-labels true
{% endhighlight shell %}

## Conky

Install conky.

{% highlight shell %}
pacman -S conky
{% endhighlight shell %}

I use a script with conky to check email with the perl```Mail::IMAPClient``` and ```IO::Socket::SSL```, on arch needs: [perl-mail-imapclient (AUR)](https://aur.archlinux.org/packages/perl-mail-imapclient/), and [perl-io-socket-ssl](https://www.archlinux.org/packages/extra/any/perl-io-socket-ssl/).

{% highlight shell %}
pacaur -S perl-mail-imapclient perl-io-socket-ssl
{% endhighlight shell %}