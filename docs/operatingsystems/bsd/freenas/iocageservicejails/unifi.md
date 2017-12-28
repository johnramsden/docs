---
title: Ubiquity Unifi jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, unifi
tags: [ freebsd, bsd, jail ]
---

# Ubiquity Unifi Controller jail

Install unifi controller in jail.

### On FreeNAS

Create jail, OpenJDK requires fdescfs, and procfs.

{%ace edit=true, lang='sh'%}
iocage create --release 11.1-RELEASE --name unifi \
          allow_raw_sockets="1" \
          mount_linprocfs="1" \
          boot="on" vnet=on \
          ip4_addr="vnet1|172.20.40.20/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1"
{%endace%}

On Freenas create datasets:

*   Datasets
    *   tank/data/unifi/data
    *   tank/data/unifi/logs
    *   tank/data/unifi/certs


Nullfs mount datasets in jail:

{%ace edit=true, lang='sh'%}
iocage fstab -a unifi /mnt/tank/data/unifi/data /usr/local/share/java/unifi/data nullfs rw 0 0
iocage fstab -a unifi /mnt/tank/data/unifi/logs /usr/local/share/java/unifi/logs nullfs rw 0 0
iocage fstab -a unifi /mnt/tank/data/unifi/certs /usr/local/share/java/unifi/certs nullfs rw 0 0
{%endace%}

Start jail.

{%ace edit=true, lang='sh'%}
iocage start unifi
{%endace%}

### In jail

Install ```net-mgmt/unifi5``` (built pkg with poudriere), or use ports.

In jail:

{%ace edit=true, lang='sh'%}
pkg install unifi5
sysrc unifi_enable=YES
{%endace%}

Set permissions.

{%ace edit=true, lang='sh'%}
chown -R unifi /usr/local/share/java/unifi
{%endace%}

Enable unifi at boot.

{%ace edit=true, lang='sh'%}
sysrc unifi_enable=YES
{%endace%}

Unifi just uses the mongod binary, it can be disabled.

{%ace edit=true, lang='sh'%}
sysrc mongod_enable=NO
{%endace%}

## Finishing Tasks

Restart the jail and confirm everything works.

{%ace edit=true, lang='sh'%}
iocage restart unifi
{%endace%}

Go to ```https://<jail ip>:8443```. Make sure you use https.

Configure with the wizard.

## AP

To SSH into AP, password ubnt.

{%ace edit=true, lang='sh'%}
ssh ubnt@<ip>
{%endace%}
