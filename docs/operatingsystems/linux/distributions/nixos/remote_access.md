---
title: Remotely Accessing Install Media with SSH
sidebar: linux_sidebar
hide_sidebar: false
category: [ nixos, linux]
keywords: nixos, linux, recovery, ssh, remote, networking
tags: [ nixos, linux, ssh, network ]
permalink: linux_nixos_remote_access.html
toc: false
folder: linux/nixos/recovery
---

If disaster occurs and it's necessary to remotely access the machine, boot into NixOS install media and access the machine using SSH.

## SSH Access

By default it's possible to SSH into the install media as root. In order to log in create a password.

{%ace edit=true, lang='sh'%}
passwd
{%endace%}

Start SSH Daemon.

{%ace edit=true, lang='sh'%}
systemctl start sshd
{%endace%}

Check the IP address.

{%ace edit=true, lang='sh'%}
ip addr
{%endace%}

Now it should be possible to access the machine as root.

 *NOTE: SSH'ing into a machine as root is a terrible practice and is only done here temporarily.*
