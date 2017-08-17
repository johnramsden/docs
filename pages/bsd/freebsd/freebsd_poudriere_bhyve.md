---
title: Poudriere in a bhyve VM
sidebar: bsd_sidebar
hide_sidebar: false
keywords: freebsd, bsd, bhyve, virtualization, poudriere, zfs
tags: [ freebsd, freenas, bsd, virtualization, zfs ]
permalink: freebsd_poudriere_bhyve.html
toc: false
folder: bsd/freebsd
---

Setup iohyve:

{% highlight shell %}
iohyve setup pool=tank
iohyve setup net=igb1
iohyve setup kmod=1
{% endhighlight shell %}

Fetch ISO:

{% highlight shell %}
iohyve fetchiso ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-bootonly.iso
iohyve deleteiso FreeBSD-11.0-RELEASE-amd64-bootonly.iso
{% endhighlight shell %}

Create guest with 20GiB HDD.

{% highlight shell %}
iohyve create poudriere 20G
iohyve set poudriere ram=8G cpu=4
{% endhighlight shell %}

Install FreeBSD 11:

{% highlight shell %}
iohyve install poudriere FreeBSD-11.0-RELEASE-amd64-bootonly.iso
{% endhighlight shell %}

Attach to console

{% highlight shell %}
iohyve console poudriere
{% endhighlight shell %}

Exit and stop the installer when finished

{% highlight shell %}
iohyve stop poudriere
{% endhighlight shell %}

Start the machine.

{% highlight shell %}
iohyve start poudriere
{% endhighlight shell %}

## In VM

Update

{% highlight shell %}
pkg update && pkg upgrade
freebsd-update fetch install
{% endhighlight shell %}

### Poudriere

Install poudriere

{% highlight shell %}
pkg install poudriere
{% endhighlight shell %}

Copy the config.

{% highlight shell %}
cp /usr/local/etc/poudriere.conf.sample /usr/local/etc/poudriere.conf
{% endhighlight shell %}

### Certs

Setup SSL to sign ports:

{% highlight shell %}
mkdir -p /usr/local/etc/ssl/{keys,certs}
chmod 0600 /usr/local/etc/ssl/keys
openssl genrsa -out /usr/local/etc/ssl/keys/poudriere.key 4096
openssl rsa -in /usr/local/etc/ssl/keys/poudriere.key -pubout -out /usr/local/etc/ssl/certs/poudriere.cert
{% endhighlight shell %}

## NFS

Start NFS

{% highlight shell %}
sysrc nfs_client_enable=YES && service nfsclient start
{% endhighlight shell %}

Mount packages

{% highlight shell %}
mount <ip address>:/mnt/tank/data/poudriere/packages /usr/local/poudriere/data/packages
{% endhighlight shell %}

Add to fstab:

{% highlight shell %}
<ip address>:/mnt/tank/data/poudriere/packages /usr/local/poudriere/data/packages nfs  rw      0       0
{% endhighlight shell %}

Add locking:

{% highlight shell %}
sysrc rpc_lockd_enable=YES && sysrc rpc_statd_enable=YES
service lockd start && service statd start
{% endhighlight shell %}


## Configuration

Edit /usr/local/etc/poudriere.conf

### Configuration

These were the settings I had uncommented:

{% highlight shell %}
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
{% endhighlight shell %}

## Setup jail:

```
poudriere jail -c -j freebsd-11-amd64 -v 11.1-RELEASE
```

Setup ports tree:

```
poudriere ports -c -p HEAD
```

Create pkg list(s) /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage

```
sysutils/py3-iocage
```

Add to make.conf : /usr/local/etc/poudriere.d/freebsd-11-amd64-make.conf

use py3.6 version of python3:

```
DEFAULT_VERSIONS+= php=7.1 python3=3.6
```

For my jails globally: /usr/local/etc/poudriere.d/make.conf

No docs, X11 NLS or egs:

```
OPTIONS_UNSET+= DOCS NLS X11 EXAMPLES
```
Set options:

pkg install dialog4ports

```
poudriere options -j freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud
```


To update jail

```
poudriere jail -u -j freebsd-11-amd64
```

Update tree:

```
poudriere ports -u -p HEAD
```

Start build(s):

```
poudriere bulk -cj freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud
```

## Web Server

pkg install nginx && sysrc nginx_enable=YES


Remove all inside server in /usr/local/etc/nginx/nginx.conf, add:

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

```
text/plain                          txt log;
```

Check config and start nginx:

```
service nginx configtest
service nginx start
```

## Repo Only server

In jail, nullfs mount packages to same spot. Install nginx.

```
server {

    listen 80 default;
    server_name pkgrepo.ramsden.network;
    root /usr/local/poudriere/data/packages;
    autoindex on;
}
```

## Clients

Get cert:

cat /usr/local/etc/ssl/certs/poudriere.cert

-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvbwvtq26XllehnB4YqpN
5RL9JU8EY682tu2BBLeRYtau5oYPtbpHyAJ/kUy1vV/759Bf6QbaRoKAbHyBYyms
LSrlHd+XNR84tSeix2e0dkpzZgsa+i3Rn+LHqbnk+JAGAG0y+vgVWPADIvI3W2Aa
9tqHLW/sxSoZS58GDsCoAwx7L/5G+FEXGmLewi544CQcGIAqMRN6Q/ClcGVZcMFw
a+eZW8CimFadUMZ3OZTysMDmm/p8lvcCUcsQ4LVD8ywO/WLNzJ9UKuBAGGAW8Vst
qFiFiWjdboTzxkpv/JKnXcEMm7tDhB0Om9RFnuctfST98o6XuvR79LM0mSo98Um1
mvDA2HliUC+JqyT/n5iU1p8R12nrXc9DoHDdhDJ3AgzyMcnDXFGA9pwPijUnwQjf
A76OZPekKSV6qgLxFPGM/qkFwMB8chfkQGeOeKJF0wwlhMuw515US5jzX7HKhbNO
jEpKf+FzMS3Xd4izH+HJcK7rRU3ZoP2ooY1pPfQkckleyPfMhFe1jZRocFVEcyY7
qHflGvjEavULGTPXMkIVXpf7C/xKIU2Ec5vVQsgD37OedVPciqejkPb06K4rmuwI
LxErMYEsya9XLztrB9HQuphWFYsSNdIwQJwOOz4iB5/GPNjRcnXM7CT93lcViNY4
0BLpTnynaQ/LQstMPlq4s7sCAwEAAQ==
-----END PUBLIC KEY-----

Save it on clients:

mkdir -p /usr/local/etc/ssl/{keys,certs}
ee /usr/local/etc/ssl/certs/poudriere.cert

## Repo

mkdir -p /usr/local/etc/pkg/repos

Define repo:

 /usr/local/etc/pkg/repos/poudriere.conf

/usr/local/etc/pkg/repos/freebsd.conf

Inside, use the name FreeBSD in order to match the default repository definition. Disable the repository by defining it like this:

FreeBSD: {
    enabled: no
}

Repo file at /usr/local/etc/pkg/repos/poudriere.conf

If you want to mix your custom packages with those of the official repositories, your file should look something like this:

poudriere: {
    url: "http://pkgrepo.ramsden.network/freebsd-11-amd64-HEAD/",
    mirror_type: "http",
    signature_type: "pubkey",
    pubkey: "/usr/local/etc/ssl/certs/poudriere.cert",
    enabled: yes,
    priority: 100
}


If you want to only use your compiled packages, your file should look something like this:

poudriere: {
    url: "http://pkgrepo.ramsden.network/freebsd-11-amd64-HEAD/",
    mirror_type: "http",
    signature_type: "pubkey",
    pubkey: "/usr/local/etc/ssl/certs/poudriere.cert",
    enabled: yes
}

Update:

pkg update

Crontab:

# Update tree at 3
0 3 * * * /usr/local/bin/poudriere ports -u -p HEAD >/dev/null 2>&1
# Jails at 3:30:
30 3 * * * /usr/local/bin/poudriere jail -u -j freebsd-11-amd64

# Build at 4
0 4 * * * poudriere bulk -cj freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/iocage -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/nextcloud -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby

# off at 6

# Reference

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-poudriere-build-system-to-create-packages-for-your-freebsd-servers
/usr/local/www/freenasUI/vm/admin.py
/usr/local/www/freenasUI/vm/utils.py

## Upgrade jails

To upgrade releases, ie 11.0 to 11.1:

/usr/local/bin/poudriere jail -u -t 11.1-RELEASE -j freebsd-11-amd64

Or delete and re-create

{% highlight shell %}
poudriere jail -d -j freebsd-11~1-amd64
poudriere jail -c -j freebsd-11-amd64 -v 11.1-RELEASE
{% endhighlight shell %}

Re-create ports tree:

{% highlight shell %}
poudriere ports -d -p HEAD
poudriere ports -c -p HEAD
{% endhighlight shell %}


## Add new ports

Emby:

Add ports.

{% highlight shell %}
ee /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby
{% endhighlight shell %}

{% highlight shell %}
multimedia/ffmpeg
graphics/ImageMagick
{% endhighlight shell %}

## Poudriere options:

{% highlight shell %}
poudriere options -j freebsd-11-amd64 -p HEAD -f /usr/local/etc/poudriere.d/portlists/freebsd-11-amd64/emby
{% endhighlight shell %}

For ffmpeg:

*   enable the ass subtitles option
*   enable the lame option
*   enable the opus subtitles option
*   enable the x265 subtitles option

For ImageMagick

*  disable (unset) 16BIT_PIXEL (to increase thumbnail generation performance)
