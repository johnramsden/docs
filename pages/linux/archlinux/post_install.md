---
title: Post Install on Arch Linux
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, aur, pacaur, zfs
tags: [ archlinux, linux, aur, postinstall, zfs ]
permalink: linux_archlinux_post_install.html
toc: true
folder: linux/archlinux
---

First [setup AUR](/archlinux_aur_pacaur.html)


## Time

Setup [time](https://wiki.archlinux.org/index.php/time) using [systemd-timesyncd](https://wiki.archlinux.org/index.php/Systemd-timesyncd).

{% highlight shell %}
timedatectl set-ntp true
timedatectl set-ntp 1
{% endhighlight shell %}

## Configure Reflector

So you always have fresh mirrors, setup [reflector](https://www.archlinux.org/packages/?name=reflector).

{% highlight shell %}
pacman -S reflector
{% endhighlight shell %}

Create service to select the 200 most recently synchronized HTTP or HTTPS mirrors, sort them by download speed, and overwrite the file ```/etc/pacman.d/mirrorlist```.

{% highlight shell %}
nano /etc/systemd/system/reflector.service
{% endhighlight shell %}

{% highlight shell %}
[Unit]
Description=Pacman mirrorlist update

[Service]
Type=oneshot
ExecStart=/usr/bin/reflector --latest 200 --protocol http --protocol https --sort rate --save /etc/pacman.d/mirrorlist
{% endhighlight shell %}

Create timer.

{% highlight shell %}
nano /etc/systemd/system/reflector.timer
{% endhighlight shell %}

{% highlight shell %}
[Unit]
Description=Run reflector weekly

[Timer]
OnCalendar=weekly
RandomizedDelaySec=12h
Persistent=true

[Install]
WantedBy=timers.target
{% endhighlight shell %}

That will run reflector weekly.

{% highlight shell %}
systemctl enable --now reflector.timer
{% endhighlight shell %}

## Configure SMTP

I used to use ssmtp but since it's now unmaintained I've started using [Msmtp](https://wiki.archlinux.org/index.php/Msmtp).

{% highlight shell %}
pacman -S msmtp msmtp-mta
{% endhighlight shell %}

Setup system default.

{% highlight shell %}
cp /usr/share/doc/msmtp/msmtprc-system.example /etc/msmtprc
{% endhighlight shell %}

Example config file

{% highlight shell %}
# msmtp system wide configuration file

# A system wide configuration file with default account.
defaults

# The SMTP smarthost.
host smtp.fastmail.com
port 465

# Construct envelope-from addresses of the form "user@oursite.example".
#auto_from on
maildomain <your domain>

# Use TLS.
tls on
tls_starttls off

# Activate server certificate verification
tls_trust_file /etc/ssl/certs/ca-certificates.crt

# Syslog logging with facility LOG_MAIL instead of the default LOG_USER.
syslog LOG_MAIL

aliases               /etc/aliases

# msmtp root account, inherit from 'default' account
account default

user <your email>

from system@<your domain>

# Terrible...
# auth plain
# password <pass>

# or with passwordeval,
# passwordeval "gpg --quiet --for-your-eyes-only --no-tty --decrypt ~/.msmtp-root.gpg"

account root : default

# password, see below
{% endhighlight shell %}

Set permissions.

{% highlight shell %}
chmod 600 /etc/msmtprc
{% endhighlight shell %}

You can setup a [gpg encrypted passphrase](https://wiki.archlinux.org/index.php/Msmtp#Password_management) if using interactively. The other (not very good option) is setting with 'password' in config.

{% highlight shell %}

{% endhighlight shell %}

Add aliases to ```/etc/aliases```.

{% highlight shell %}
root: root@<yourdomain>
{% endhighlight shell %}

If anything private is in /etc/msmtprc, secure the file [as shown](https://wiki.archlinux.org/index.php/SSMTP#Security) on the Arch wiki.

Create an ssmtp group and set the owner of ```/etc/msmtp``` and the msmtp binary.

{% highlight shell %}
groupadd msmtp
chown :msmtp /etc/msmtprc
chown :msmtp /usr/bin/msmtp
{% endhighlight shell %}

Make sure only root, and the msmtp group can access ```msmtprc```, then et the SGID bit on the binary

{% highlight shell %}
chmod 640 /etc/msmtprc
chmod g+s /usr/bin/msmtp
{% endhighlight shell %}

Then add a pacman hook to always set the file permissions after the package has been upgraded:

{% highlight shell %}
nano /usr/local/bin/msmtp-set-permissions
{% endhighlight shell %}

{% highlight shell %}
#!/bin/sh

chown :msmtp /usr/bin/msmtp
chmod g+s /usr/bin/msmtp
{% endhighlight shell %}

Make it executable:

{% highlight shell %}
chmod u+x /usr/local/bin/msmtp-set-permissions
{% endhighlight shell %}

Now add the pacman hook:

{% highlight shell %}
nano /usr/share/libalpm/hooks/msmtp-set-permissions.hook
{% endhighlight shell %}

{% highlight shell %}
[Trigger]
Operation = Install
Operation = Upgrade
Type = Package
Target = msmtp

[Action]
Description = Set msmtp permissions for security
When = PostTransaction
Exec = /usr/local/bin/msmtp-set-permissions
{% endhighlight shell %}

### Test mail

Send a test mail.

{% highlight shell %}
 echo "Text, more text." | /usr/bin/mail -s SUBJECT email@your.domain.com
{% endhighlight shell %}

## ZFS Configuration

I always set up snapshotting and replication as one of the first things I do on a new desktop.

### Enable Snapshots

Install [zfs-auto-snapshot (AUR)](https://aur.archlinux.org/packages/zfs-auto-snapshot-git/) and setup snapshotting on all datasets.

{% highlight shell %}
pacaur -S zfs-auto-snapshot-git
systemctl enable --now zfs-auto-snapshot-daily.timer
{% endhighlight shell %}

Set all datasets to snapshot and disable any datasets that dont require snapshotting.

{% highlight shell %}
for ds in $(zfs list -H -o name); do
  MP="$(zfs get -H -o value mountpoint $ds )";
  if [ ${MP} == "legacy" ] || [ "${MP}" == "/" ]; then
    echo "${ds}: on";
    zfs set com.sun:auto-snapshot=true ${ds};
  else
    echo "${ds}: off";
    zfs set com.sun:auto-snapshot=false ${ds};
  fi;
done
{% endhighlight shell %}

In one line:

{% highlight shell %}
for ds in $(zfs list -H -o name); do MP="$(zfs get -H -o value mountpoint $ds )"; if [ ${MP} == "legacy" ] || [ "${MP}" == "/" ]; then echo "${ds}: on"; zfs set com.sun:auto-snapshot=true ${ds}; else echo "${ds}: off";zfs set com.sun:auto-snapshot=false ${ds}; fi; done
{% endhighlight shell %}

### ZFS Replication With ZnapZend

Install [ZnapZend (AUR)](https://aur.archlinux.org/packages/znapzend/) (it's a great tool, I maintain the AUR package).

{% highlight shell %}
pacaur -S znapzend
systemctl enable --now znapzend
{% endhighlight shell %}

Create a config for each dataset thet needs replicating, where SYSTEM will be a name for the dataset at ```${POOL}/replication/${SYSTEM}``` on the remote. Specify the remote user and IP as well. Here is a small script I use for my setup. The grep can be adjusted to exclude any datasets that are unwanted.

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

I would then run, for chin on ```replicator@<server ip>```.

{% highlight shell %}
./znapcfg "tank/replication/chin" "replicator" "<server ip>"
{% endhighlight shell %}

### Scrub

Setup a monthly scrub. Easiest way to set this up as install the [systemd-zpool-scrub (AUR)](https://aur.archlinux.org/packages/systemd-zpool-scrub/) package.

{% highlight shell %}
pacaur -S systemd-zpool-scrub
systemctl enable --now zpool-scrub@vault.timer
{% endhighlight shell %}

This could also easily set up by just installing a systemd unit containing the following.

{% highlight shell %}
nano /usr/lib/systemd/system/zpool-scrub@.service
{% endhighlight shell %}

{% highlight shell %}
[Unit]
Description=Scrub ZFS Pool
Requires=zfs.target
After=zfs.target

[Service]
Type=oneshot
ExecStartPre=-/usr/bin/zpool scrub -s %i
ExecStart=/usr/bin/zpool scrub %i
{% endhighlight shell %}

### Enable The ZFS Event Daemon

If an SMTP or MTA is configured, setup [The ZFS Event Daemon (ZED)](https://ramsdenj.com/2016/08/29/arch-linux-on-zfs-part-3-followup.html#zed-the-zfs-event-daemon)

{% highlight shell %}
nano /etc/zfs/zed.d/zed.rc
{% endhighlight shell %}

Ad an email and mail program and set verbosity.

{% highlight shell %}
ZED_EMAIL_ADDR="root"
ZED_EMAIL_PROG="mail"
ZED_NOTIFY_VERBOSE=1
{% endhighlight shell %}

Start and enable the daemon.

{% highlight shell %}
systemctl enable --now zfs-zed.service
{% endhighlight shell %}

Start a scrub and check for an email.

{% highlight shell %}
zpool scrub vault
{% endhighlight shell %}

## Define Hostid

[Define a hostid](https://ramsdenj.com/2016/06/23/arch-linux-on-zfs-part-2-installation.html#first-tasks) or problems arise at boot.

## S.M.A.R.T

Install [smartmontools](https://www.archlinux.org/packages/?name=smartmontools).

{% highlight shell %}
pacman -S smartmontools
{% endhighlight shell %}

### Tests

Long or short tests can be run on a disk. A short test will check for device problems. The long test is just a short test plus complete disc surface examination.

Long test example:

{% highlight shell %}
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -t long /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{% endhighlight shell %}

Veiw results:

{% highlight shell %}
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -H /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{% endhighlight shell %}

Or, veiw all test results.

{% highlight shell %}
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -l selftest /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{% endhighlight shell %}

Or detailed results.

{% highlight shell %}
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -a /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{% endhighlight shell %}

### Daemon

The smartd daemon can also run, periodically running tests and will send you a message if a problem occurs.

Edit the configuration file at ```/etc/smartd.conf```.

{% highlight shell %}
nano /etc/smartd.conf
{% endhighlight shell %}

To check for all errors on a disk use the option ```-a``` after the disk ID.

{% highlight shell %}
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657 -a -m <email>
/dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M -a -m <email>
{% endhighlight shell %}

To test if your mail notification is working run a test, add ```-m <email address> -M test``` to the end of the config. This will run the test on the start of the daemon.:

{% highlight shell %}
DEVICESCAN -m <email address> -M test
{% endhighlight shell %}

Start smartd:

{% highlight shell %}
systemctl start smartd
{% endhighlight shell %}

My config looks like:

{% highlight shell %}
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657 -a -m <email>
/dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M -a -m <email>
{% endhighlight shell %}

## nfs


{% highlight shell %}
pacman -S nfs-utils
systemctl enable --now rpcbind.service nfs-client.target remote-fs.target
{% endhighlight shell %}

Rpc has [a bug](https://bugs.archlinux.org/task/50663) caused by glibc, [until it's resolved force rpc.gssd to start](https://wiki.archlinux.org/index.php/NFS#Client).

{% highlight shell %}
systemctl edit rpc-gssd.service
{% endhighlight shell %}

{% highlight shell %}
[Unit]
Requires=network-online.target
After=network-online.target

[Service]
Type=simple
ExecStart=
ExecStart=/usr/sbin/rpc.gssd -f
{% endhighlight shell %}

## Autofs

Install [autofs](https://www.archlinux.org/packages/?name=autofs).

{% highlight shell %}
pacman -S autofs
{% endhighlight shell %}

{% highlight shell %}
nano /etc/autofs/auto.master
{% endhighlight shell %}

Add or uncomment the following.

{% highlight shell %}
/net    -hosts   --timeout=60
{% endhighlight shell %}

Start and enable.

{% highlight shell %}
systemctl enable --now autofs
{% endhighlight shell %}
