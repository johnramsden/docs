---
title: Linux Tuning with Sysctls
sidebar: linux_sidebar
hide_sidebar: false
keywords: linux, tuning, sysctl
tags: [ tuning, linux, networking ]
permalink: linux_tuning_sysctls.html
toc: false
folder: linux/tuning
---

## Inotify:

Increase inotify max user watches:

{% highlight shell %}
echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.d/40-max-user-watches.conf
{% endhighlight shell %}

## Network

Increase [netdev budget](https://access.redhat.com/sites/default/files/attachments/20150325_network_performance_tuning.pdf) for squeezed packets, and netdev_max_backlog.

{% highlight shell %}
echo "net.core.netdev_budget=50000" > /etc/sysctl.d/30-network-tuning.conf
echo "net.core.netdev_max_backlog = 100000" >> /etc/sysctl.d/30-network-tuning.conf
{% endhighlight shell %}

{% highlight shell %}
cat /etc/sysctl.d/30-network-tuning.conf
{% endhighlight shell %}

{% highlight shell %}
net.core.netdev_budget=50000
net.core.netdev_max_backlog = 100000
{% endhighlight shell %}

## Reload Sysctls

{% highlight shell %}
sysctl --system
{% endhighlight shell %}

# References:
https://github.com/firehol/netdata/issues/1076
