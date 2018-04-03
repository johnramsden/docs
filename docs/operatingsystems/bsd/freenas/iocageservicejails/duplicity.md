---
title: duplicity jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, duplicity
tags: [ freebsd, bsd, jail ]
---

## Duplicity jail

Setup for Duplicity service jail with iocage.

### On FreeNAS

Create jail:

{%ace edit=true, lang='sh'%}
iocage create --release 11.1-RELEASE --name duplicity \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.41/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

Create user on FreeNAS with ID `983`, `nologin` to match the user in the jail.

Nullfs mount datasets to backup in jail:

Duplicity data:

{%ace edit=true, lang='sh'%}
iocage exec duplicity 'mkdir -p /mnt/duplicity/data'
iocage fstab --add duplicity '/mnt/tank/data/syncthing/sync /mnt/duplicity/data nullfs rw 0 0'
{%endace%}

Start jail and enter.

{%ace edit=true, lang='sh'%}
iocage console duplicity
{%endace%}

### Jail

In the jail, update all packages and install ```duplicity``` and `py27-boto`.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install duplicity py27-boto
{%endace%}

Create a user with uid `983` to match mounted data.

{%ace edit=true, lang='sh'%}
pw useradd -n duplicity -u 983
{%endace%}

Add script `/usr/local/scripts/duplicitybak`, put secrets in `/usr/local/scripts/duplicitybak.auth`.

{%ace edit=true, lang='sh'%}
#!/bin/sh

# on freebsd install duplicity, py27-boto

# Place auth variables: PASSPHRASE, GS_ACCESS_KEY_ID, GS_SECRET_ACCESS_KEY
. "/usr/local/scripts/duplicitybak.auth"

# Folders to backup
BACKUP_DATA_REGEXP='Workspace|Computer|Personal|Pictures|University'
BACKUP_ROOT="/mnt/duplicity/data"

# GS configuration variables
GS_BUCKET="johnramsdenbackup"

# Remove files older than 60 days from GS
duplicity remove-older-than 60D --force gs://${GS_BUCKET}

# Sync everything to GS
duplicity --include-regexp "${BACKUP_DATA_REGEXP}" \
          --exclude='**' \
          ${BACKUP_ROOT} gs://${GS_BUCKET}

# Cleanup failures
duplicity cleanup --force gs://${GS_BUCKET}

unset PASSPHRASE
unset GS_ACCESS_KEY_ID
unset GS_SECRET_ACCESS_KEY
{%endace%}

Secrets in `/usr/local/scripts/duplicitybak.auth`:

{%ace edit=true, lang='sh'%}
# Create password to use for symetric GPG encryption
export PASSPHRASE=""

# Create GS bucket, https://console.cloud.google.com/storage/
# enable interoperable access, get keys
export GS_ACCESS_KEY_ID=""
export GS_SECRET_ACCESS_KEY=""
{%endace%}

Set executable:

{%ace edit=true, lang='sh'%}
chmod +x /usr/local/scripts/duplicitybak
{%endace%}

Now I can be run from a crontab outside of the jail: 

{%ace edit=true, lang='sh'%}
iocage exec duplicity /usr/local/scripts/duplicitybak
{%endace%}
