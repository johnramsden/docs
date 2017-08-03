---
title: Remotely Accessing Install Media with SSH
sidebar: linux_sidebar
hide_sidebar: false
keywords: nixos, linux, recovery, ssh, remote, network
tags: [ nixos, linux, ssh, network ]
permalink: nixos_remote_access.html
toc: false
folder: linux/nixos/recovery
---

If disaster occurs and it's necessary to remotely access the machine, boot into NixOS install media and access the machine using SSH.

## SSH Access

By default it's possible to SSH into the install media as root. In order to log in create a password.

{% highlight shell %}
passwd
{% endhighlight shell %}

Start SSH Daemon.

{% highlight shell %}
systemctl start sshd
{% endhighlight shell %}

Check the IP address.

{% highlight shell %}
ip addr
{% endhighlight shell %}

Now it should be possible to access the machine as root.

 *NOTE: SSH'ing into a machine as root is a terrible practice and is only done here temporarily.*
