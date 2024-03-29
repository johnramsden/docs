---
title: syncthing jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, syncthing
tags: [ freebsd, bsd, jail ]
---

## Syncthing jail

Setup for Syncthing service jail with iocage.

### On FreeNAS

Create jail:

{%ace lang='sh'%}
iocage create --release 11.1-RELEASE --name syncthing \
          boot="on" vnet=on bpf=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.33/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

Create user Syncthing on FreeNAS with ID `983`, `nologin` to match the user in the jail.

On Freenas create datasets:

*   Datasets
    *   Syncthing Data
        *   ```tank/data/syncthing```

Nullfs mount datasets in jail:

Syncthing data:

{%ace lang='sh'%}
iocage exec syncthing 'mkdir -p /mnt/syncthing/data'
iocage fstab --add syncthing '/mnt/tank/data/syncthing/sync /mnt/syncthing/data nullfs rw 0 0'
{%endace%}

Start jail and enter.

{%ace lang='sh'%}
iocage start syncthing
iocage console syncthing
{%endace%}

### Jail

In the jail, update all packages and install ```syncthing```.

{%ace lang='sh'%}
pkg update && pkg upgrade
pkg install syncthing ca_root_nss
{%endace%}

Enable the service on boot.

{%ace lang='sh'%}
sysrc 'syncthing_enable=YES'
sysrc 'syncthing_user=syncthing' && sysrc 'syncthing_group=syncthing'
sysrc 'syncthing_home=/var/db/syncthing'
{%endace%}

Start the syncthing service.

{%ace lang='sh'%}
service syncthing start
{%endace%}

### Configure

Start syncthing as an initial test:


{%ace lang='sh'%}
service syncthing restart
{%endace%}

Edit ```/var/db/syncthing/config.xml``` and change the IP address which the GUI will be accessible from. This will enable accessing the GUI from a remote computer:

Before:

{%ace lang='xml'%}
<gui enabled="true" tls="false">
 <address>127.0.0.1:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
{%endace%}

After:

{%ace lang='xml' %}
<gui enabled="true" tls="false">
 <address>0.0.0.0:8384</address>;
 <apikey>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</apikey>;
</gui>
{%endace%}

Restart the service for changes to apply:

{%ace lang='sh'%}
service syncthing restart
{%endace%}

Finally, access the GUI by pointing a browser to the server's address and port, ie ```http://SERVER_URL:8384```.
