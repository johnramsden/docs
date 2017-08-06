---
title: Post Install on Arch Linux
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur
tags: [ archlinux, linux, aur, postinstall ]
permalink: archlinux_post_install.html
toc: false
folder: linux/archlinux
---

First [setup AUR](/archlinux_aur_pacaur.html)


## Time

Setup [time](https://wiki.archlinux.org/index.php/time) using [systemd-timesyncd](https://wiki.archlinux.org/index.php/Systemd-timesyncd).

{% highlight shell %}
timedatectl set-ntp true
timedatectl set-ntp 1
{% endhighlight shell %}

## Enable Snapshots

Install ```zfs-auto-snapshot``` and setup snapshotting on all datasets.

{% highlight shell %}
pacaur -S zfs-auto-snapshot-git
systemctl enable --now zfs-auto-snapshot-daily.timer

for ds in $(sudo zfs list -H -o name); do echo "Setting: ${ds}"; zfs set com.sun:auto-snapshot=true ${ds}; done
{% endhighlight shell %}

Disable any datasets that dont require snapshotting.

{% highlight shell %}
zfs set com.sun:auto-snapshot=false vault
zfs set com.sun:auto-snapshot=false vault/sys
zfs set com.sun:auto-snapshot=false vault/sys/chin
zfs set com.sun:auto-snapshot=false vault/sys/chin/ROOT
zfs set com.sun:auto-snapshot=false vault/sys/chin/var/lib/systemd
zfs set com.sun:auto-snapshot=false vault/sys/chin/usr
zfs set com.sun:auto-snapshot=false vault/sys/chin/var
zfs set com.sun:auto-snapshot=false vault/sys/chin/var/lib
zfs set com.sun:auto-snapshot=false vault/sys/chin/var/cache
zfs set com.sun:auto-snapshot=false vault/sys/chin/home/john/cache
{% endhighlight shell %}

## Setup ZFS Replication With ZnapZend

Install [ZnapZend](https://github.com/oetiker/znapzend) (it's a great tool, I maintain the AUR package).

{% highlight shell %}
pacaur -S znapzend
{% endhighlight shell %}

Create a config for each dataset thet needs replicating, where SYSTEM will be a name for the dataset at "${POOL}/replication/${SYSTEM}" on the remote. Specify the remote user and IP as well. Here is a small script I use for my setup. The grep can be adjusted to exclude any datasets that are unwanted.

{% highlight shell %}
#!/bin/sh

REMOTE_POOL_ROOT="${1}"
REMOTE_USER="${2}"
REMOTE_IP="${3}"

for ds in $(zfs list -H -o name | \
    grep -E 'data/|default|john/|usr/|var/|lib/' | \
    grep -v cache); do
  echo "Creating: ${REMOTE_USER}@${REMOTE_IP}:${REMOTE_POOL_ROOT}/${ds}"

  # See ssh(1) for -tt
  # https://www.freebsd.org/cgi/man.cgi?query=ssh
  # In simple terms, force pseudo-terminal and pseudo tty
    ssh -tt ${REMOTE_USER}@${REMOTE_IP} \
      "~/znap_check_dataset ${REMOTE_POOL_ROOT}/${ds}"

  znapzendzetup create --tsformat='%Y-%m-%d-%H%M%S' \
    SRC '1d=>15min,7d=>1h,30d=>4h,90d=>1d' ${ds} \
    DST:${REMOTE_IP} '1d=>15min,7d=>1h,30d=>4h,90d=>1d,1y=>1w,10y=>1month' \
    "${REMOTE_USER}@${REMOTE_IP}:${REMOTE_POOL_ROOT}/${ds}"
done
{% endhighlight shell %}

On remote I have a pre-znazendzetup script which makes sure the remote location exists.

{% highlight shell %}
#!/bin/sh

# Pre zapzendzetup script. Put in ~/znap_check_dataset on remote and run with

ds="${1}"

if [ "$(zfs list -H -o name "${ds}")" = "${ds}" ]; then
  echo "${ds} exists, running ZnapZend."
else
  echo "Creating non-existant dataset ${ds}"
  zfs create -p "${ds}"
  zfs unmount "${ds}"
  echo "${ds} created, running ZnapZend."
fi
{% endhighlight shell %}

I would then run, for chin on ```replicator@lilan.ramsden.network```.

{% highlight shell %}
./znapcfg "tank/replication/chin" "replicator" "lilan.ramsden.network"
{% endhighlight shell %}



## Scrub

{% highlight shell %}
pacaur -S systemd-zpool-scrub
systemctl enable --now zpool-scrub@vault.timer
{% endhighlight shell %}

## SSMTP

pacman -S ssmtp
nsno /etc/ssmtp/ssmtp.conf

{% highlight shell %}
#
# /etc/ssmtp.conf -- a config file for sSMTP sendmail.
#
# Example for fastmail.


# The user that gets all the mails (UID < 1000, usually the admin)
root=<email>

# The mail server (where the mail is sent to)
# https://www.fastmail.com/help/technical/servernamesandports.html
mailhub=<mail server>
# mail.messagingengine.com:465

# The address where the mail appears to come from for user authentication.
rewriteDomain=<host address>

# The full hostname
hostname=<hostname>

# Use SSL/TLS before starting negotiation
UseTLS=Yes
UseSTARTTLS=No

# Username/Password
AuthUser=<email>
AuthPass=<password>

# Email 'From header's can override the default domain?
FromLineOverride=yes
{% endhighlight shell %}

Create revaliases.

{% highlight shell %}
nano /etc/ssmtp/revaliases
{% endhighlight shell %}

{% highlight shell %}
root:<roots email>
{% endhighlight shell %}

NO! Setup msmtp instead.

## ZED
# uncomment root
suno /etc/zfs/zed.d/zed.rc

## nfs
pacman -S nfs-utils
systemctl enable rpcbind.service nfs-client.target remote-fs.target
