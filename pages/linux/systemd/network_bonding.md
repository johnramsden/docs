---
title: Network Bonding
sidebar: linux_sidebar
hide_sidebar: false
keywords: systemd, linux, bond, networking
tags: [ systemd, linux, networking ]
permalink: systemd.html
toc: false
folder: linux/systemd
---

Going from a one interface setup, to two bonded:

Before:

{% highlight shell %}
nano /etc/systemd/network/25-wired.network
{% endhighlight shell %}

{% highlight shell %}
[Match]
Name=eno1

[Network]
Address=172.20.20.2/24
Gateway=172.20.20.1
{% endhighlight shell %}

Create the [netdev](https://www.freedesktop.org/software/systemd/man/systemd.netdev.html) bond file ```/etc/systemd/network/25-bond1.netdev```.

{% highlight shell %}
nano /etc/systemd/network/25-bond1.netdev
{% endhighlight shell %}

{% highlight shell %}
[NetDev]
Name=bond1
Kind=bond

#default is "balance-rr" (round robin)
[Bond]
#Mode="balance-rr
{% endhighlight shell %}

Create network for bond.

{% highlight shell %}
nano /etc/systemd/network/25-bond1.network
{% endhighlight shell %}

{% highlight shell %}
[Match]
Name=bond1

[Network]
Address=172.20.20.2/24
Gateway=172.20.20.1
{% endhighlight shell %}

Select interfaces.

{% highlight shell %}
nano /etc/systemd/network/20-eno1.network
{% endhighlight shell %}

{% highlight shell %}
[Match]
Name=eno1

[Network]
Bond=bond1
{% endhighlight shell %}

{% highlight shell %}
nano /etc/systemd/network/25-enp5s0.network
{% endhighlight shell %}

{% highlight shell %}
[Match]
Name=enp5s0

[Network]
Bond=bond1
{% endhighlight shell %}

Restart network:

{% highlight shell %}
systemctl restart systemd-resolved systemd-networkd
{% endhighlight shell %}

Check if functional:

{% highlight shell %}
networkctl
{% endhighlight shell %}

Before:

{% highlight shell %}
IDX LINK             TYPE               OPERATIONAL SETUP
  1 lo               loopback           carrier     unmanaged
  2 eno1             ether              routable    configured
  3 enp5s0           ether              off         unmanaged
  4 virbr0           ether              no-carrier  unmanaged
  5 virbr0-nic       ether              off         unmanaged

5 links listed.
{% endhighlight shell %}

After:

{% highlight shell %}
IDX LINK             TYPE               OPERATIONAL SETUP
  1 lo               loopback           carrier     unmanaged
  2 bond0            ether              off         unmanaged
  3 bond1            ether              routable    configured
  4 eno1             ether              carrier     configuring
  5 enp5s0           ether              no-carrier  configuring
  6 virbr0           ether              no-carrier  unmanaged
  7 virbr0-nic       ether              off         unmanaged

7 links listed.
{% endhighlight shell %}

**Note**: ```systemd``` automatically creates bond0, it can be ignored.

Status:

{% highlight shell %}
cat /proc/net/bonding/bond1
{% endhighlight shell %}

{% highlight shell %}

{% endhighlight shell %}

**Note**: DNS using ```systemd-resolved``` config in ```/etc/systemd/resolved.conf```

## References

https://kerlilow.me/blog/setting-up-systemd-networkd-with-bonding/#setting-up-the-bond
https://www.freedesktop.org/software/systemd/man/systemd.netdev.html
https://www.reversengineered.com/2014/08/21/setting-up-bonding-in-systemd/
