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

## References

* https://wiki.archlinux.org/index.php/Linux_Containers#Enable_support_to_run_unprivileged_containers_.28optional.29
* https://stgraber.org/2017/06/15/custom-user-mappings-in-lxd-containers/
