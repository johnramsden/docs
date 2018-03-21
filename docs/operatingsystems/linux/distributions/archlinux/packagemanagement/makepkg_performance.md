---
title: makepkg Performance
tags: [ archlinux, linux ]
---
f0:9f:c2:6c:61:58	172.20.60.2	unifi1	Unifi AP	 
f0:9f:c2:6c:61:48	172.20.60.3	unifi2
# makepkg Performance

The following options can be set in the global `/etc/makepkg.conf` file.

{%ace edit=true, lang='sh'%}
nano /etc/makepkg.conf
{%endace%}

See [archwiki](https://wiki.archlinux.org/index.php/Makepkg#Improving_compile_times) for more information.

## Parallel Compilation

Use your number of processors.

Set `MAKEFLAGS="-j$(nproc)"`, or explicitly, if you have 8, `MAKEFLAGS="-j8`.

## Build in tmpfs

Set builddir to a `tmpfs` backed location.

{%ace edit=true, lang='sh'%}
BUILDDIR=/tmp/makepkg
{%endace%}

