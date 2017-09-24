---
title: Linux General Tuning
sidebar: linux_sidebar
hide_sidebar: false
keywords: linux, tuning, sysctl
tags: [ tuning, linux, networking ]
permalink: linux_tunin.html
toc: false
folder: linux
---

## Inotify:

Increase inotify max user watches:

{% highlight shell %}
echo "fs.inotify.max_user_watches=524288" > /etc/sysctl.d/40-max-user-watches.conf
{% endhighlight shell %}

## Network

Increase [netdev budget](https://access.redhat.com/sites/default/files/attachments/20150325_network_performance_tuning.pdf) for squeezed packets:

{% highlight shell %}
echo "net.core.netdev_budget=1200" > /etc/sysctl.d/30-netdev-budget.conf
{% endhighlight shell %}
