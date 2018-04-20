---
title: Wrong Version jail
sidebar: bsd_sidebar
hide_sidebar: false
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail
tags: [ freebsd, freenas, bsd ]
permalink: bsd_freenas_wrong_version_jail.html
toc: false
folder: bsd/freenas
---

If a different version of FreeNAS is running from the version of a jail. For example, the FreeBSD version FreeNAS is based upon is 11.0, but a jail is based on 10.3, the following error can occur when attempting to install something from ports in a jail.

> make: "/usr/ports/Mk/bsd.port.mk" line 1177: UNAME_r (11.0-STABLE) and OSVERSION (1003000) do not agree on major version number

There are two solutions to this problem, the non-permanent option is to set an environment variable in the current shell with ```setenv UNAME_r 10.3-RELEASE```.

The permanent solution is to set the environment variable by editing ```/etc/login.conf```, and adding the jail's version.

{%ace lang='sh'%}
default:\
:setenv=UNAME_r=10.3-RELEASE:\
{%endace%}

Reset the database.

{%ace lang='sh'%}
cap_mkdb /etc/login.conf
{%endace%}

Exit and enter shell and everything should work.
