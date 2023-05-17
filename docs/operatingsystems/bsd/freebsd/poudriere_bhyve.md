---
title: Poudriere in a bhyve VM
sidebar: bsd_sidebar
hide_sidebar: false
category: [ bsd, freebsd ]
keywords: freebsd, bsd, bhyve, virtualization, poudriere, zfs
tags: [ freebsd, freenas, bsd, virtualization, zfs ]
permalink: bsd_freebsd_poudriere_bhyve.html
toc: true
folder: bsd/freebsd
---

Setup iohyve:

{%ace lang='sh'%}
iohyve setup pool=tank
iohyve setup net=igb1
iohyve setup kmod=1
{%endace%}

Fetch ISO:

{%ace lang='sh'%}
iohyve fetchiso ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-bootonly.iso
iohyve deleteiso FreeBSD-11.0-RELEASE-amd64-bootonly.iso
{%endace%}

Create guest with 20GiB HDD.

{%ace lang='sh'%}
iohyve create poudriere 20G
iohyve set poudriere ram=8G cpu=4
{%endace%}

Install FreeBSD 11:

{%ace lang='sh'%}
iohyve install poudriere FreeBSD-11.0-RELEASE-amd64-bootonly.iso
{%endace%}

Attach to console

{%ace lang='sh'%}
iohyve console poudriere
{%endace%}

Exit and stop the installer when finished

{%ace lang='sh'%}
iohyve stop poudriere
{%endace%}

Start the machine.

{%ace lang='sh'%}
iohyve start poudriere
{%endace%}

## In VM

Update

{%ace lang='sh'%}
pkg update && pkg upgrade
freebsd-update fetch install
{%endace%}

### Poudriere

Install poudriere

{%ace lang='sh'%}
pkg install poudriere
{%endace%}

Copy the config.

{%ace lang='sh'%}
cp /usr/local/etc/poudriere.conf.sample /usr/local/etc/poudriere.conf
{%endace%}

### Certs

Setup SSL to sign ports:

{%ace lang='sh'%}
mkdir -p /usr/local/etc/ssl/{keys,certs}
chmod 0600 /usr/local/etc/ssl/keys
openssl genrsa -out /usr/local/etc/ssl/keys/poudriere.key 4096
openssl rsa -in /usr/local/etc/ssl/keys/poudriere.key -pubout -out /usr/local/etc/ssl/certs/poudriere.cert
{%endace%}

## NFS

Start NFS

{%ace lang='sh'%}
sysrc nfs_client_enable=YES && service nfsclient start
{%endace%}

Mount packages

{%ace lang='sh'%}
mount <ip address>:/mnt/tank/data/poudriere/packages /usr/local/poudriere/data/packages
{%endace%}

Add to fstab:

{%ace lang='sh'%}
<ip address>:/mnt/tank/data/poudriere/packages /usr/local/poudriere/data/packages nfs  rw      0       0
{%endace%}

Add locking:

{%ace lang='sh'%}
sysrc rpc_lockd_enable=YES && sysrc rpc_statd_enable=YES
service lockd start && service statd start
{%endace%}


## Configuration

Edit /usr/local/etc/poudriere.conf

### Configuration

These were the settings I had uncommented:

{%ace lang='sh'%}
# Poudriere can optionally use ZFS for its ports/jail storage. For
# ZFS define ZPOOL, otherwise set NO_ZFS=yes
#
#### ZFS
# The pool where poudriere will create all the filesystems it needs
# poudriere will use tank/${ZROOTFS} as its root
#
# You need at least 7GB of free space in this pool to have a working
# poudriere.
#
ZPOOL=zroot

# the host where to download sets for the jails setup
# You can specify here a host or an IP
# replace _PROTO_ by http or ftp
# replace _CHANGE_THIS_ by the hostname of the mirrors where you want to fetch
# by default: ftp://ftp.freebsd.org
#
# Also note that every protocols supported by fetch(1) are supported here, even
# file:///
# Suggested: https://download.FreeBSD.org
FREEBSD_HOST=https://download.FreeBSD.org

# By default the jails have no /etc/resolv.conf, you will need to set
# RESOLV_CONF to a file on your hosts system that will be copied has
# /etc/resolv.conf for the jail, except if you don't need it (using an http
# proxy for example)
RESOLV_CONF=/etc/resolv.conf

# The directory where poudriere will store jails and ports
BASEFS=/usr/local/poudriere

# Use portlint to check ports sanity
USE_PORTLINT=no

# Use tmpfs(5)
# This can be a space-separated list of options:
# wrkdir    - Use tmpfs(5) for port building WRKDIRPREFIX
# data      - Use tmpfs(5) for poudriere cache/temp build data
# localbase - Use tmpfs(5) for LOCALBASE (installing ports for packaging/testing)
# all       - Run the entire build in memory, including builder jails.
# yes       - Only enables tmpfs(5) for wrkdir
# no        - Disable use of tmpfs(5)
# EXAMPLE: USE_TMPFS="wrkdir data"
USE_TMPFS=yes

# How much memory to limit tmpfs size to for *each builder* in GiB
# (default: none)
TMPFS_LIMIT=2

# If set the given directory will be used for the distfiles
# This allows to share the distfiles between jails and ports tree
DISTFILES_CACHE=/usr/ports/distfiles

# Automatic OPTION change detection
# When bulk building packages, compare the options from kept packages to
# the current options to be built. If they differ, the existing package
# will be deleted and the port will be rebuilt.
# Valid options: yes, no, verbose
# verbose will display the old and new options
CHECK_CHANGED_OPTIONS=verbose

# Automatic Dependency change detection
# When bulk building packages, compare the dependencies from kept packages to
# the current dependencies for every port. If they differ, the existing package
# will be deleted and the port will be rebuilt. This helps catch changes such
# as DEFAULT_RUBY_VERSION, PERL_VERSION, WITHOUT_X11 that change dependencies
# for many ports.
# Valid options: yes, no
CHECK_CHANGED_DEPS=yes

# Path to the RSA key to sign the PKGNG repo with. See pkg-repo(8)
PKG_REPO_SIGNING_KEY=/usr/local/etc/ssl/keys/poudriere.key

# URL where your POUDRIERE_DATA/logs are hosted
# This will be used for giving URL hints to the HTML output when
# scheduling and starting builds
URL_BASE=http://<domain>/

# When using ATOMIC_PACKAGE_REPOSITORY, commit the packages if some
# packages fail to build. Ignored ports are considered successful.
# This can be set to 'no' to only commit the packages once no failures
# are encountered.
# Default: yes
COMMIT_PACKAGES_ON_FAILURE=no

# Define the building jail hostname to be used when building the packages
# Some port/packages hardcode the hostname of the host during build time
# This is a necessary setup for reproducible builds.
BUILDER_HOSTNAME=<domain>
{%endace%}

## Create jail

Create a new '11.1-RELEASE' jail with the name 'freebsd-11-amd64'.

{%ace lang='sh'%}
poudriere jail -c -j freebsd-11-amd64 -v 11.1-RELEASE
{%endace%}

Setup ports tree:

{%ace lang='sh'%}
poudriere ports -c -p HEAD
{%endace%}

Create pkg list(s) ```/usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage```

{%ace lang='sh'%}
sysutils/py3-iocage
{%endace%}

Add to make.conf : /usr/local/etc/poudriere.d/freebsd-11-amd64-make.conf

use py3.6 version of python3:

{%ace lang='sh'%}
DEFAULT_VERSIONS+= php=7.1 python3=3.6
{%endace%}

For my jails globally: ```/usr/local/etc/poudriere.d/make.conf```

No docs, X11 NLS or egs:

{%ace lang='sh'%}
OPTIONS_UNSET+= DOCS NLS X11 EXAMPLES
{%endace%}

Set options:

{%ace lang='sh'%}
pkg install dialog4ports
{%endace%}

{%ace lang='sh'%}
poudriere options -j freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud
{%endace%}


To update jail

{%ace lang='sh'%}
poudriere jail -u -j freebsd-11-amd64
{%endace%}

Update tree:

{%ace lang='sh'%}
poudriere ports -u -p HEAD
{%endace%}

Start build(s):

{%ace lang='sh'%}
poudriere bulk -cj freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud
{%endace%}

## Web Server

{%ace lang='sh'%}
pkg install nginx && sysrc nginx_enable=YES
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

Edit mimetypes /usr/local/etc/nginx/mime.types, add log:

{%ace lang='sh'%}
text/plain                          txt log;
{%endace%}

Check config and start nginx:

{%ace lang='sh'%}
service nginx configtest
service nginx start
{%endace%}

## Repo Only server

In jail, nullfs mount packages to same spot. Install nginx.

{%ace lang='sh'%}
server {

    listen 80 default;
    server_name pkgrepo.ramsden.network;
    root /usr/local/poudriere/data/packages;
    autoindex on;
}
{%endace%}

## Clients

Get cert:

{%ace lang='sh'%}
cat /usr/local/etc/ssl/certs/poudriere.cert
{%endace%}

Save it on clients:

{%ace lang='sh'%}
mkdir -p /usr/local/etc/ssl/{keys,certs}
ee /usr/local/etc/ssl/certs/poudriere.cert
{%endace%}

## Repo

{%ace lang='sh'%}
mkdir -p /usr/local/etc/pkg/repos
{%endace%}

Define repo:

{%ace lang='sh'%}
ee /usr/local/etc/pkg/repos/freebsd.conf
{%endace%}

Inside, use the name FreeBSD in order to match the default repository definition. Disable the repository by defining it like this:

{%ace lang='sh'%}
FreeBSD: {
    enabled: no
}
{%endace%}

Repo file at ```/usr/local/etc/pkg/repos/poudriere.conf```

If you want to mix your custom packages with those of the official repositories, your file should look something like this:

{%ace lang='sh'%}
poudriere: {
    url: "http://pkgrepo.ramsden.network/freebsd-11-amd64-HEAD/",
    mirror_type: "http",
    signature_type: "pubkey",
    pubkey: "/usr/local/etc/ssl/certs/poudriere.cert",
    enabled: yes,
    priority: 100
}
{%endace%}


If you want to only use your compiled packages, your file should look something like this:

{%ace lang='sh'%}
poudriere: {
    url: "http://pkgrepo.ramsden.network/freebsd-11-amd64-HEAD/",
    mirror_type: "http",
    signature_type: "pubkey",
    pubkey: "/usr/local/etc/ssl/certs/poudriere.cert",
    enabled: yes
}
{%endace%}

Update:

{%ace lang='sh'%}
pkg update
{%endace%}

Crontab:

{%ace lang='sh'%}
# Update tree at 3
0 3 * * * /usr/local/bin/poudriere ports -u -p HEAD >/dev/null 2>&1
# Jails at 3:30:
30 3 * * * /usr/local/bin/poudriere jail -u -j freebsd-11-amd64

# Build at 4
0 4 * * * poudriere bulk -cj freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby
{%endace%}

## Upgrade jails

To upgrade releases, ie 11.0 to 11.1:

{%ace lang='sh'%}
/usr/local/bin/poudriere jail -u -t 11.1-RELEASE -j freebsd-11-amd64
{%endace%}

Or delete and re-create

{%ace lang='sh'%}
poudriere jail -d -j freebsd-11-amd64
poudriere jail -c -j freebsd-11-amd64 -v 11.1-RELEASE
{%endace%}

Re-create ports tree:

{%ace lang='sh'%}
poudriere ports -d -p HEAD
poudriere ports -c -p HEAD
{%endace%}

## Add new ports

Add additional lists. for example, Emby:

Add ports.

{%ace lang='sh'%}
ee /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby
{%endace%}

{%ace lang='sh'%}
multimedia/ffmpeg
graphics/ImageMagick
{%endace%}

## Poudriere options:

{%ace lang='sh'%}
poudriere options -j freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby
{%endace%}

For ffmpeg:

*   enable the ass subtitles option
*   enable the lame option
*   enable the opus subtitles option
*   enable the x265 subtitles option

For ImageMagick

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)

# Reference

*   [DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-poudriere-build-system-to-create-packages-for-your-freebsd-servers)
