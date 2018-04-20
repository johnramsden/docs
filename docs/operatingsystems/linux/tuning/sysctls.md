---
title: Linux Tuning with Sysctls
category: [ linux-tuning, linux]
keywords: linux, tuning, sysctl
tags: [ tuning, linux, networking ]
---

## Inotify:

Increase inotify max user watches:

{%ace lang='sh'%}
echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.d/40-max-user-watches.conf
{%endace%}

## Network

Increase [netdev budget](https://access.redhat.com/sites/default/files/attachments/20150325_network_performance_tuning.pdf) for squeezed packets, and netdev_max_backlog.

Add other [optimizations](https://wiki.archlinux.org/index.php/Sysctl#Networking) for better performance.

{%ace lang='sh'%}
[root]# nano /etc/sysctl.d/30-network-tuning.conf
{%endace%}


{%ace lang='sh'%}
# The maximum size of the receive queue.
# The received frames will be stored in this queue after taking them from the ring buffer on the NIC.
# Use high value for high speed cards to prevent loosing packets.
net.core.netdev_max_backlog = 100000

net.core.netdev_budget=50000

# The upper limit on the value of the backlog parameter passed to the listen function.
# Setting to higher values is only needed on a single highloaded server where new connection rate is high/bursty
net.core.somaxconn = 16384

# The default and maximum amount for the receive/send socket memory
# By default the Linux network stack is not configured for high speed large file transfer across WAN links.
# This is done to save memory resources.
# You can easily tune Linux network stack by increasing network buffers size for high-speed networks that connect server systems to handle more network packets.
net.core.rmem_default = 1048576
net.core.wmem_default = 1048576
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.udp_rmem_min = 16384
net.ipv4.udp_wmem_min = 16384

# The maximum queue length of pending connections 'Waiting Acknowledgment'
# In the event of a synflood DOS attack, this queue can fill up pretty quickly, at which point tcp_syncookies will kick in allowing your system to continue to respond to legitimate traffic, and allowing you to gain access to block malicious IPs.
# If the server suffers from overloads at peak times, you may want to increase this value a little bit.
net.ipv4.tcp_max_syn_backlog = 65536
{%endace%}

## Reload Sysctls

{%ace lang='sh'%}
sysctl --system
{%endace%}

# References:
https://github.com/firehol/netdata/issues/1076
