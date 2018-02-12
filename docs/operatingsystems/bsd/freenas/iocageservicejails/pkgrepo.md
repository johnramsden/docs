---
title: pkgrepo jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, pkgrepo
tags: [ freebsd, bsd, jail ]
---

## pkgrepo jail

Setup for poudriere webui jail with iocage.

### On FreeNAS

Create jail:

{%ace edit=true, lang='sh'%}
iocage create --release 11.1-RELEASE --name pkgrepo \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.40/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

Mount packages from host into jail with nullfs.

{%ace edit=true, lang='sh'%}
iocage exec pkgrepo 'mkdir -p /usr/local/poudriere/data/packages'
iocage fstab --add pkgrepo '/mnt/tank/data/poudriere/packages /usr/local/poudriere/data/packages nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace edit=true, lang='sh'%}
iocage fstab --list pkgrepo
{%endace%}

Start jail and enter.

{%ace edit=true, lang='sh'%}
iocage start pkgrepo
iocage console pkgrepo
{%endace%}

### Jail

In the jail, update all packages.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
{%endace%}

### Web Server

{%ace edit=true, lang='sh'%}
pkg install nginx poudriere && sysrc nginx_enable=YES
{%endace%}

Remove all inside server in ```/usr/local/etc/nginx/nginx.conf```, add:

```
server {

    listen 80 default;
    server_name server_domain_or_IP;
    root /usr/local/share/poudriere/html;

    location /data {
        alias /usr/local/poudriere/data/logs/bulk;
        autoindex on;
    }

    location /packages {
        root /usr/local/poudriere/data;
        autoindex on;
    }

}
```

Edit mimetypes ```/usr/local/etc/nginx/mime.types```, add log:

{%ace edit=true, lang='sh'%}
text/plain                          txt log;
{%endace%}

Check config and start nginx:

{%ace edit=true, lang='sh'%}
service nginx configtest
service nginx start
{%endace%}

### Repo Only server

Alternately, have no webui.

In jail, nullfs mount packages to same spot. Install nginx.

{%ace edit=true, lang='sh'%}
server {

    listen 80 default;
    server_name pkgrepo.ramsden.network;
    root /usr/local/poudriere/data/packages;
    autoindex on;
}
{%endace%}