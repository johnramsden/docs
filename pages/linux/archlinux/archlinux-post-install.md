---
title: Setting up pacaur with the Arch User Repository
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur
tags: [ archlinux, linux, aur, postinstall ]
permalink: archlinux_aur_pacaur.html
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

{% highlight shell %}
pacaur -S zfs-auto-snapshot-git
systemctl enable --now zfs-auto-snapshot-daily.timer

for ds in $(sudo zfs list -H -o name); do echo "Setting: ${ds}"; zfs set com.sun:auto-snapshot=true ${ds}; done

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

Setup znapzend later.

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
