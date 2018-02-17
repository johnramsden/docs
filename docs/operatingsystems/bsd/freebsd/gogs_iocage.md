---
title: iocage
sidebar: bsd_sidebar
hide_sidebar: false
category: [ bsd, freebsd ]
keywords: freebsd, bsd, iocage, containerization
tags: [ freebsd, bsd, containerization ]
permalink: bsd_freebsd_iocage.html
toc: false
folder: bsd/freebsd
---

Create jail `gogs`.

Install `gogs`

```
pkg update && pkg upgrade && pkg install gogs
```

```
You installed gogs: Go Git Service.

It is recommended to run gogs as a service:
# service gogs start

To enable the service at startup you should execute the command:
sysrc gogs_enable="YES"

You can also run gogs manually with a command:
# gogs

Connect to gogs on the default port 3000:
http://localhost:3000

Configuration file is /usr/local/etc/gogs/conf/app.ini.
You can only edit it when gogs isn't running.

Gogs needs an SSH daemon, so make sure sure you execute:
sysrc sshd_enable="YES"
and sshd is configured to listen on the same port that is configured
in gogs.
```

### Configuration

Mount git storage to `/var/db/gogs/repositories`. 

Owned by git.

```
chown -R git:git /var/db/gogs/repositories
```
Edit `/usr/local/etc/gogs/conf/app.ini`.

Set

```
[server]
DOMAIN = git.ramsden.network

[repository]
SCRIPT_TYPE = sh

[service]
; Does not allow register and admin create account only
DISABLE_REGISTRATION = true 
; User must sign in to view anything.
REQUIRE_SIGNIN_VIEW = true
```

Set

```
sysrc gogs_enable=YES sshd_enable=YES
```

Start

```
service sshd start && service gogs start
```

Visit `http://<domain>:3000`