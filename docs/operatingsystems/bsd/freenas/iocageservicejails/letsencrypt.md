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

Setup directories for certs:

{%ace edit=true, lang='sh'%}
iocage exec letsencrypt 'mkdir -p /mnt/certs/couchpotato.ramsden.network /mnt/certs/emby.ramsden.network /mnt/certs/lilan.ramsden.network /mnt/certs/sabnzbd.ramsden.network /mnt/certs/sickrage.ramsden.network /mnt/certs/syncthing.ramsden.network'
{%endace%}

Mount the directories:

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
iocage console letsencrypt
{%endace%}

### Jail

In the jail, update all packages and install ```acme.sh```.

{%ace edit=true, lang='sh'%}
pkg update && pkg upgrade
pkg install acme.sh
{%endace%}

Switch to the ‘acme’ user which renews the certificate on a cron job
add configuration.

{%ace edit=true, lang='sh'%}
su - acme
{%endace%}

Issue cert

{%ace edit=true, lang='sh'%}
export CF_Email="****************"
export CF_Key="****************"

acme.sh --issue --dns dns_cf -d emby.ramsden.network
{%endace%}

Add acme to le in FreeNAS and jail.

{%ace edit=true, lang='sh'%}
pw groupadd -n le -g 2000 && pw groupmod le -m acme
{%endace%}

chown certs dir in freenas to acme:le recursively.


## Set Install Location

Now, to set the install location for the certificates use the installcert command, for example:

{%ace edit=true, lang='sh'%}
acme.sh --installcert -d lilan.ramsden.network \
--certpath /mnt/certs/lilan.ramsden.network/Lilan_s_LetsEncrypt_Certificate.crt \
--keypath /mnt/certs/lilan.ramsden.network/Lilan_s_LetsEncrypt_Certificate.key
{%endace%}

Cert deploy location: /etc/certificates

## Various Services

Various Services need their certificates installed two different locations, and some of them need some changes. There are a few that I make changes to from the default.

### Emby

Emby needs pks file, to convert cert key cert and ca are needed

Set deploy location

{%ace edit=true, lang='sh'%}
ACME_BIN="~/.acme.sh/acme.sh"

SERVER="emby.ramsden.network"
CERT_DEPLOY_DIR="/mnt/certs"

# Certs
CERT="${SERVER}.cer"
KEY="${SERVER}.key"
CA="ca.cer"
PKCS="${SERVER}.pfx"

# Set deploy location:

acme.sh --installcert -d "${SERVER}" \
    --certpath "${CERT_DEPLOY_DIR}/${SERVER}/${CERT}" \
    --keypath "${CERT_DEPLOY_DIR}/${SERVER}/${KEY}" \
    --capath "${CERT_DEPLOY_DIR}/${SERVER}/${CA}"

# Convert to pkcs
openssl pkcs12 -export -out ${CERT_DEPLOY_DIR}/${SERVER}/${PKCS} \
               -inkey ${CERT_DEPLOY_DIR}/${SERVER}/${KEY} \
               -in ${CERT_DEPLOY_DIR}/${SERVER}/${CERT} \
               -certfile ${CERT_DEPLOY_DIR}/${SERVER}/${CA} \
               -passout pass:
{%endace%}

Install directory in jail: /var/db/emby-server/ssl

### Cron:

Crontab from freenas:

You probably want to renew starts on a crontab so they get done every month. I use the following script to renew my various services:

{%ace edit=true, lang='sh'%}
#!/bin/sh

# letsencrypt Jail
le_jail="letsencrypt"
le_user="acme"

cert_db="/mnt/tank/data/database/letsencrypt/certs"
jail_db="/mnt/tank/data/database"

# Cloudflare account
export CF_Email=""
export CF_Key=""

############# MAIN CODE #############

convert_pkcs(){
  server="${1}"
  pass="${2}"
  out_name="${3}"
  key="${4}"
  cert="${5}"
  ca="${6}"

  echo
  echo "Generating pkcs for ${server}"
  echo "to ${cert_db}/${server}/${out_name}"

  openssl pkcs12 -export -out "${cert_db}/${server}/${out_name}" \
                 -inkey ${cert_db}/${server}/${key} \
                 -in ${cert_db}/${server}/${cert} \
                 -certfile ${cert_db}/${server}/${ca} \
                 -passout ${pass}
}

# Install to jail, locations relative to jail db
# eg
# deploy "emby/ssl" "letsencrypt/certs" "media" "media" "660"
deploy(){
  server="${1}"
  deploy_location="${2}"
  owner="${3}"
  group="${4}"
  perms="${5}"
  echo
  echo "Installing certs for: ${server}"
  echo "with deploy location: ${deploy_location}"

# Install certs to {}
find "${cert_db}/${server}/" -type f \
  -exec install -b -m ${perms} \
            -o ${owner} -g ${group} {} ${deploy_location} \;
}

# Run acme in jail to check if certs need renewing, if so renew
iocage exec --jail_user ${le_user} ${le_jail} /bin/sh -c \
  'acme.sh --cron --force --home "/var/db/acme/.acme.sh"'

# convert emby's key to pkcs
convert_pkcs "emby.ramsden.network" "pass:" \
    "emby.ramsden.network.pfx" \
    "emby.ramsden.network.key" \
    "emby.ramsden.network.cer" \
    "ca.cer"
# deploy emby's certs
deploy "emby.ramsden.network" \
    "${jail_db}/emby/emby-server/ssl/" \
    "media" "media" "770"

# Restart emby
iocage exec emby /bin/sh -c 'service emby-server restart'

# deploy lilan's certs? Saved in /etc/certificates
#install -b -B ".old-`date +%Y-%m-%d-%H:%M:%S`" -m 400 -o root -g wheel \
#/mnt/tank/data/database/letsencrypt/certs/lilan.ramsden.network/Lilan_s_LetsEncrypt_Certificate.key \
#/etc/certificates
#deploy "lilan.ramsden.network" \
#    "/etc/certificates" \
#    "root" "wheel" "400"

echo
echo "Finished deploying keys"

{%endace%}
