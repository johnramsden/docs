---
title: User Namespaces
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, containers
tags: [ archlinux, linux, containers ]
---

# User Namespaces

Enable [user namespaces](https://wiki.archlinux.org/index.php/Linux_Containers#Enable_support_to_run_unprivileged_containers_.28optional.29)

## Requirements

First enable the sysctl: 

{%ace lang='sh'%}
echo 'sysctl kernel.unprivileged_userns_clone = 1' | tee /etc/sysctl.d/20-unprivileged_userns.conf
{%endace%}

Reload sysctl's with `sysctl --system`

## User (G/U)IDs

Setup LXC mappings in `/etc/lxc/default.conf`.

```
lxc.idmap = u 0 100000 65536
lxc.idmap = g 0 100000 65536
```

Edit shadow files for g/uids

{%ace lang='sh'%}
cat /etc/subuid /etc/subgid
{%endace%}

```
root:100000:65536
john:165536:231072

root:100000:65536
john:165536:231072
```

Now add changed mapping to userns containers.

## User Setup

Setup directories. Similar paths:

* /etc/lxc/lxc.conf => ~/.config/lxc/lxc.conf
* /etc/lxc/default.conf => ~/.config/lxc/default.conf
* /var/lib/lxc => ~/.local/share/lxc
* /var/lib/lxcsnaps => ~/.local/share/lxcsnaps
* /var/cache/lxc => ~/.cache/lxc

Create zfs dataset for containers:

{%ace lang='sh'%}
mkdir ~/.local/share/lxc
zfs create -o mountpoint=legacy vault/sys/wooly/home/john/local/share/lxc
mount -t zfs vault/sys/wooly/home/john/local/share/lxc /home/john/.local/share/lxc
chown -R john:john /home/john/.local/share/lxc
{%endace%}

Add to fstab (double check it).

{%ace lang='sh'%}
genfstab -U / | grep /home/john/.local/share/lxc | tee --append /etc/fstab
{%endace%}

Let user create up to 10 bridges.

{%ace lang='sh'%}
echo 'john veth lxcbr0 10' | tee --append /etc/lxc/lxc-usernet
{%endace%}

*NOTE: May need to enable `haveged.service` (I got gpg errors without it).*

## Create Container

{%ace lang='sh'%}
lxc-create --template=download --name=tiger
{%endace%}

## References

* https://wiki.archlinux.org/index.php/Linux_Containers#Enable_support_to_run_unprivileged_containers_.28optional.29
* https://stgraber.org/2017/06/15/custom-user-mappings-in-lxd-containers/
* https://stgraber.org/2014/01/17/lxc-1-0-unprivileged-containers/
