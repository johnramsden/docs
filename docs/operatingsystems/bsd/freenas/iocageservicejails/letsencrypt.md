---
title: Lets Encrypt jail
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, jail, letsencrypt
tags: [ freebsd, bsd, jail ]
---

## Lets Encrypt jail

Setup for letsencrypt service jail with iocage.

### On FreeNAS

Create jail:

{%ace edit=true, lang='sh'%}
iocage create --release 11.1-RELEASE --name letsencrypt \
          boot="on" vnet=on \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.38/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

#### Datasets

On FreeNAS create user and group acme, GID/UID 169.

In web ui create mount datasets:
*   letsencrypt
    *   letsencrypt Data
        *    mountpoint: `/var/db/acme/`
            *   `/mnt/tank/data/database/letsencrypt/acme`
    *   certs
        *    mountpoints: `/mnt/certs/<cert>`
            *   `couchpotato.ramsden.network`
                *    `/mnt/certs/couchpotato.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/couchpotato.ramsden.network`
            *   `emby.ramsden.network`
                *    `/mnt/certs/emby.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/emby.ramsden.network`
            *   `lilan.ramsden.network`
                *    `/mnt/certs/lilan.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/lilan.ramsden.network`
            *   `sabnzbd.ramsden.network`
                *    `/mnt/certs/sabnzbd.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/sabnzbd.ramsden.network`
            *   `sickrage.ramsden.network`
                *    `/mnt/certs/sabnzbd.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/sabnzbd.ramsden.network`
            *   `syncthing.ramsden.network`
                *    `/mnt/certs/syncthing.ramsden.network`
                *    `/mnt/tank/data/database/letsencrypt/certs/syncthing.ramsden.network`

Have the acme user own thedataset`tank/data/database/letsencrypt/acme`.

Mount `/mnt/tank/data/database/letsencrypt/acme` to `/var/db/acme/`
Mount the certs under `/var/db/acme/certs/`

Nullfs mount datasets in jail:

letsencrypt data:

{%ace edit=true, lang='sh'%}
iocage exec letsencrypt 'mkdir -p /var/db/acme'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/acme /var/db/acme nullfs rw 0 0'
{%endace%}

Setup directories for cert:

{%ace edit=true, lang='sh'%}
iocage exec letsencrypt 'mkdir -p /mnt/certs/couchpotato.ramsden.network /mnt/certs/emby.ramsden.network /mnt/certs/lilan.ramsden.network /mnt/certs/sabnzbd.ramsden.network /mnt/certs/sickrage.ramsden.network /mnt/certs/syncthing.ramsden.network'
{%endace%}

Repeat for media:

{%ace edit=true, lang='sh'%}
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/couchpotato.ramsden.network /mnt/certs/couchpotato.ramsden.network nullfs rw 0 0'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/emby.ramsden.network /mnt/certs/emby.ramsden.network nullfs rw 0 0'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/lilan.ramsden.network /mnt/certs/lilan.ramsden.network nullfs rw 0 0'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/sabnzbd.ramsden.network /mnt/certs/sabnzbd.ramsden.network nullfs rw 0 0'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/sickrage.ramsden.network /mnt/certs/sickrage.ramsden.network nullfs rw 0 0'
iocage fstab --add letsencrypt '/mnt/tank/data/database/letsencrypt/certs/syncthing.ramsden.network /mnt/certs/syncthing.ramsden.network nullfs rw 0 0'
{%endace%}

Check fstab:

{%ace edit=true, lang='sh'%}
iocage fstab --list letsencrypt
{%endace%}

Start jail and enter.

{%ace edit=true, lang='sh'%}
iocage start letsencrypt
iocage console letsencrypt
{%endace%}

### Jail

In the jail, update all packages and install ```letsencrypt-server```.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install letsencrypt-server
{%endace%}

#### Package Options

Its reccomended to change some package options. Either build a package with poudriere with these changes, or make these changes on the letsencrypt jails packages.

##### FFMpeg

It's recommended to install ffmpeg from ports so that certain compile time options can be enabled.

Update the FreeBSD ports tree

{%ace edit=true, lang='sh'%}
portsnap fetch extract update
{%endace%}

Remove the default ffmpeg package

{%ace edit=true, lang='sh'%}
pkg delete -f ffmpeg
{%endace%}

Reinstall FFMpeg from ports with lame option enabled

{%ace edit=true, lang='sh'%}
cd /usr/ports/multimedia/ffmpeg && make config
{%endace%}

*   enable the lame option
*   enable the ass subtitles option
*   enable the opus subtitles option
*   enable the x265 subtitles option

Compile and install.

{%ace edit=true, lang='sh'%}
make install clean
{%endace%}

##### ImageMagick

It is recommended to recompile the graphics/ImageMagick package from ports with the following options .

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)

Delete the imagemagick pkg.

{%ace edit=true, lang='sh'%}
pkg delete -f imagemagick
{%endace%}

Install from ports

{%ace edit=true, lang='sh'%}
cd /usr/ports/graphics/ImageMagick && make config
{%endace%}

*   Disable the 16BIT_PIXEL option

{%ace edit=true, lang='sh'%}
make install clean
{%endace%}

### letsencrypt Start Options

Set the rc script executable.

{%ace edit=true, lang='sh'%}
chmod 555 /usr/local/etc/rc.d/letsencrypt-server
{%endace%}

Check the options.

{%ace edit=true, lang='sh'%}
less /usr/local/etc/rc.d/letsencrypt-server
{%endace%}

Set letsencrypt to start on boot and change the options based on setup.

{%ace edit=true, lang='sh'%}
sysrc 'letsencrypt_server_enable=YES'
sysrc 'letsencrypt_server_user=media' && sysrc 'letsencrypt_server_group=media'
sysrc 'letsencrypt_server_data_dir=/var/db/letsencrypt-server'
{%endace%}

Start the letsencrypt service.

{%ace edit=true, lang='sh'%}
service letsencrypt-server start
{%endace%}

# Setup

## Users

Create user le in jail and web UI with U/G ID 2000

```
Username   : le
Password   : <disabled>
Full Name  : Lets Encrypt
Uid        : 2000
Class      :
Groups     : le
Home       : /home/le
Home Mode  :
Shell      : /bin/sh
Locked     : no
OK? (yes/no): yes
```

# Datasets

In web ui create mount datasets:
    'letsencrypt'
        'le'
            mountpoint: '/home/le/.acme.sh'
        'certs'
          mountpoints: '/home/le/.acme.sh/<cert>'
            'couchpotato.ramsden.network'
                /mnt/certs/couchpotato.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/couchpotato.ramsden.network
            'emby.ramsden.network'
                /mnt/certs/emby.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/emby.ramsden.network
            'lilan.ramsden.network'
                /mnt/certs/lilan.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/lilan.ramsden.network
            'sabnzbd.ramsden.network'
                /mnt/certs/sabnzbd.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/sabnzbd.ramsden.network
            'sickrage.ramsden.network'
                /mnt/certs/sabnzbd.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/sabnzbd.ramsden.network
            'syncthing.ramsden.network'
                /mnt/certs/syncthing.ramsden.network
                /mnt/tank/data/database/letsencrypt/certs/syncthing.ramsden.network

Mount le to '/home/le/'
Mount the certs under /home/le/acme/certs/

## In Jail

```
curl https://get.acme.sh | sh
```

add configuration

```
export CF_Email="ramsdenj@shaw.ca"
export CF_Key="bd0173d0985bdcfac8036c826f1fe5b4d17e9"
```

# Issue cert

On host

```
$ jexec -U le letsencrypt sh

export CF_Email="ramsdenj@shaw.ca"
export CF_Key="bd0173d0985bdcfac8036c826f1fe5b4d17e9"

~/.acme.sh/acme.sh --issue --dns dns_cf -d lilan.ramsden.network
~/.acme.sh/acme.sh --issue --dns dns_cf -d couchpotato.ramsden.network
~/.acme.sh/acme.sh --issue --dns dns_cf -d emby.ramsden.network
~/.acme.sh/acme.sh --issue --dns dns_cf -d sabnzbd.ramsden.network
~/.acme.sh/acme.sh --issue --dns dns_cf -d sickrage.ramsden.network
~/.acme.sh/acme.sh --issue --dns dns_cf -d syncthing.ramsden.network
```

## Lilan

```
~/.acme.sh/acme.sh --installcert -d lilan.ramsden.network \
--certpath /mnt/certs/lilan.ramsden.network/Lilan_s_LetsEncrypt_Certificate.crt \
--keypath /mnt/certs/lilan.ramsden.network/Lilan_s_LetsEncrypt_Certificate.key
```

Cert deploy location: /etc/certificates

## Syncthing

Syncthing location:

Jail location:
  /syncthing/var/db/
Cert (syncthing.ramsden.network.cer):
  /mnt/tank/jails/syncthing/var/db/syncthing/https-cert.pem
Key:
  /mnt/tank/jails/syncthing/var/db/syncthing/https-key.pem

Setup crontab to replace:

Monthly replace cert and install.

Add install setting:

```
~/.acme.sh/acme.sh --installcert -d syncthing.ramsden.network \
    --certpath /mnt/certs/syncthing.ramsden.network/https-cert.pem \
    --keypath /mnt/certs/syncthing.ramsden.network/https-key.pem
```

## Sickrage

Final location: /mnt/tank/jails/sickrage/var/db/sickrage/

Need certs:

```
/var/db/sickrage/server.crt
/var/db/sickrage/server.key
```

Set to full path in gui.

Set deploy location

```
~/.acme.sh/acme.sh --installcert -d sickrage.ramsden.network \
    --certpath /mnt/certs/sickrage.ramsden.network/server.crt \
    --keypath /mnt/certs/sickrage.ramsden.network/server.key
```


## Emby

Emby needs pks file, to convert cert key cert and ca are needed

Set deploy location

```
ACME_BIN="~/.acme.sh/acme.sh"

SERVER="emby.ramsden.network"
CERT_DEPLOY_DIR="/mnt/certs"

# Certs
CERT="${SERVER}.cer"
KEY="${SERVER}.key"
CA="ca.cer"
PKCS="${SERVER}.pfx"

# Set deploy location:

~/.acme.sh/acme.sh --installcert -d "${SERVER}" \
    --certpath "${CERT_DEPLOY_DIR}/${SERVER}/${CERT}" \
    --keypath "${CERT_DEPLOY_DIR}/${SERVER}/${KEY}" \
    --capath "${CERT_DEPLOY_DIR}/${SERVER}/${CA}"

# Convert to pkcs
openssl pkcs12 -export -out ${CERT_DEPLOY_DIR}/${SERVER}/${PKCS} \
               -inkey ${CERT_DEPLOY_DIR}/${SERVER}/${KEY} \
               -in ${CERT_DEPLOY_DIR}/${SERVER}/${CERT} \
               -certfile ${CERT_DEPLOY_DIR}/${SERVER}/${CA} \
               -passout pass:
```

Install directory in jail: /var/db/emby-server/ssl


## Couchpotato

Final location: /mnt/tank/jails/couchpotato/var/db/couchpotato/ssl/

Need Certs:
```
couchpotato.ramsden.network.cer
couchpotato.ramsden.network.key
```

```
ACME_BIN="~/.acme.sh/acme.sh"

SERVER="couchpotato.ramsden.network"
CERT_DEPLOY_DIR="/mnt/certs"

# Certs
CERT="${SERVER}.cer"
KEY="${SERVER}.key"

# Set deploy location:

~/.acme.sh/acme.sh --installcert -d "${SERVER}" \
    --certpath "${CERT_DEPLOY_DIR}/${SERVER}/${CERT}" \
    --keypath "${CERT_DEPLOY_DIR}/${SERVER}/${KEY}"
```


## Sabnzbd

Final location: /mnt/tank/jails/sabnzbd/var/db/sabnzbd/admin/
/var/db/sabnzbd/admin/server.cert
/var/db/sabnzbd/admin/server.key


```
ACME_BIN="~/.acme.sh/acme.sh"

SERVER="sabnzbd.ramsden.network"
CERT_DEPLOY_DIR="/mnt/certs"

# Certs
CERT="server.cert"
KEY="server.key"

# Set deploy location:

~/.acme.sh/acme.sh --installcert -d "${SERVER}" \
    --certpath "${CERT_DEPLOY_DIR}/${SERVER}/${CERT}" \
    --keypath "${CERT_DEPLOY_DIR}/${SERVER}/${KEY}"
```

Now enable and select certs in gui. Make sure this is done with cewerts in place!

### Cron:

Crontab from freenas:

```
jexec -U le letsencrypt /bin/sh -c \
  '"~/.acme.sh"/acme.sh --cron -f --home "~/.acme.sh"'
```
