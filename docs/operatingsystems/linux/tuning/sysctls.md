---
title: Linux Tuning with Sysctls
category: [ linux-tuning, linux]
keywords: linux, tuning, sysctl
tags: [ tuning, linux, networking ]
folder: linux/tuning
---

## Inotify:

Increase inotify max user watches:

{%ace edit=true, lang='sh'%}
echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.d/40-max-user-watches.conf
{%endace%}

## Network

Increase [netdev budget](https://access.redhat.com/sites/default/files/attachments/20150325_network_performance_tuning.pdf) for squeezed packets, and netdev_max_backlog.

{%ace edit=true, lang='sh'%}
echo "net.core.netdev_budget=50000" > /etc/sysctl.d/30-network-tuning.conf
echo "net.core.netdev_max_backlog = 100000" >> /etc/sysctl.d/30-network-tuning.conf
{%endace%}

{%ace edit=true, lang='sh'%}
cat /etc/sysctl.d/30-network-tuning.conf
{%endace%}

{%ace edit=true, lang='sh'%}
net.core.netdev_budget=50000
net.core.netdev_max_backlog = 100000
{%endace%}

## Reload Sysctls

{%ace edit=true, lang='sh'%}
sysctl --system
{%endace%}

# References:
https://github.com/firehol/netdata/issues/1076
