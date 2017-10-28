---
title: Post Install on Arch Linux
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, aur, pacaur, zfs
tags: [ archlinux, linux, aur, postinstall, zfs ]
permalink: linux_archlinux_post_install.html
toc: true
folder: linux/archlinux
---

First [setup AUR](/archlinux_aur_pacaur.html)


## Time

Setup [time](https://wiki.archlinux.org/index.php/time) using [systemd-timesyncd](https://wiki.archlinux.org/index.php/Systemd-timesyncd).

{%ace edit=true, lang='sh'%}
timedatectl set-ntp true
timedatectl set-ntp 1
{%endace%}

## Configure Reflector

So you always have fresh mirrors, setup [reflector](https://www.archlinux.org/packages/?name=reflector).

{%ace edit=true, lang='sh'%}
pacman -S reflector
{%endace%}

Create service to select the 200 most recently synchronized HTTP or HTTPS mirrors, sort them by download speed, and overwrite the file ```/etc/pacman.d/mirrorlist```.

{%ace edit=true, lang='sh'%}
nano /etc/systemd/system/reflector.service
{%endace%}

{%ace edit=true, lang='sh'%}
[Unit]
Description=Pacman mirrorlist update

[Service]
Type=oneshot
ExecStart=/usr/bin/reflector --latest 200 --protocol http --protocol https --sort rate --save /etc/pacman.d/mirrorlist
{%endace%}

Create timer.

{%ace edit=true, lang='sh'%}
nano /etc/systemd/system/reflector.timer
{%endace%}

{%ace edit=true, lang='sh'%}
[Unit]
Description=Run reflector weekly

[Timer]
OnCalendar=weekly
RandomizedDelaySec=12h
Persistent=true

[Install]
WantedBy=timers.target
{%endace%}

That will run reflector weekly.

{%ace edit=true, lang='sh'%}
systemctl enable --now reflector.timer
{%endace%}

## Configure SMTP

I used to use ssmtp but since it's now unmaintained I've started using [Msmtp](https://wiki.archlinux.org/index.php/Msmtp).

{%ace edit=true, lang='sh'%}
pacman -S msmtp msmtp-mta
{%endace%}

Setup system default.

{%ace edit=true, lang='sh'%}
cp /usr/share/doc/msmtp/msmtprc-system.example /etc/msmtprc
{%endace%}

Example config file

{%ace edit=true, lang='sh'%}
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
{%endace%}

Set permissions.

{%ace edit=true, lang='sh'%}
chmod 600 /etc/msmtprc
{%endace%}

You can setup a [gpg encrypted passphrase](https://wiki.archlinux.org/index.php/Msmtp#Password_management) if using interactively. The other (not very good option) is setting with 'password' in config.

{%ace edit=true, lang='sh'%}

{%endace%}

Add aliases to ```/etc/aliases```.

{%ace edit=true, lang='sh'%}
root: root@<yourdomain>
{%endace%}

If anything private is in /etc/msmtprc, secure the file [as shown](https://wiki.archlinux.org/index.php/SSMTP#Security) on the Arch wiki.

Create an ssmtp group and set the owner of ```/etc/msmtp``` and the msmtp binary.

{%ace edit=true, lang='sh'%}
groupadd msmtp
chown :msmtp /etc/msmtprc
chown :msmtp /usr/bin/msmtp
{%endace%}

Make sure only root, and the msmtp group can access ```msmtprc```, then et the SGID bit on the binary

{%ace edit=true, lang='sh'%}
chmod 640 /etc/msmtprc
chmod g+s /usr/bin/msmtp
{%endace%}

Then add a pacman hook to always set the file permissions after the package has been upgraded:

{%ace edit=true, lang='sh'%}
nano /usr/local/bin/msmtp-set-permissions
{%endace%}

{%ace edit=true, lang='sh'%}
#!/bin/sh

chown :msmtp /usr/bin/msmtp
chmod g+s /usr/bin/msmtp
{%endace%}

Make it executable:

{%ace edit=true, lang='sh'%}
chmod u+x /usr/local/bin/msmtp-set-permissions
{%endace%}

Now add the pacman hook:

{%ace edit=true, lang='sh'%}
nano /usr/share/libalpm/hooks/msmtp-set-permissions.hook
{%endace%}

{%ace edit=true, lang='sh'%}
[Trigger]
Operation = Install
Operation = Upgrade
Type = Package
Target = msmtp

[Action]
Description = Set msmtp permissions for security
When = PostTransaction
Exec = /usr/local/bin/msmtp-set-permissions
{%endace%}

### Test mail

Send a test mail.

{%ace edit=true, lang='sh'%}
 echo "Text, more text." | /usr/bin/mail -s SUBJECT email@your.domain.com
{%endace%}

## ZFS Configuration

I always set up snapshotting and replication as one of the first things I do on a new desktop.

### Enable Snapshots

Install [zfs-auto-snapshot (AUR)](https://aur.archlinux.org/packages/zfs-auto-snapshot-git/) and setup snapshotting on all datasets.

{%ace edit=true, lang='sh'%}
pacaur -S zfs-auto-snapshot-git
systemctl enable --now zfs-auto-snapshot-daily.timer
{%endace%}

Set all datasets to snapshot and disable any datasets that dont require snapshotting.

{%ace edit=true, lang='sh'%}
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
{%endace%}

In one line:

{%ace edit=true, lang='sh'%}
for ds in $(zfs list -H -o name); do MP="$(zfs get -H -o value mountpoint $ds )"; if [ ${MP} == "legacy" ] || [ "${MP}" == "/" ]; then echo "${ds}: on"; zfs set com.sun:auto-snapshot=true ${ds}; else echo "${ds}: off";zfs set com.sun:auto-snapshot=false ${ds}; fi; done
{%endace%}

### ZFS Replication With ZnapZend

Install [ZnapZend (AUR)](https://aur.archlinux.org/packages/znapzend/) (it's a great tool, I maintain the AUR package).

{%ace edit=true, lang='sh'%}
pacaur -S znapzend
systemctl enable --now znapzend
{%endace%}

Create a config for each dataset thet needs replicating, where SYSTEM will be a name for the dataset at ```${POOL}/replication/${SYSTEM}``` on the remote. Specify the remote user and IP as well. Here is a small script I use for my setup. The grep can be adjusted to exclude any datasets that are unwanted.

{%ace edit=true, lang='sh'%}
#!/bin/sh

REMOTE_POOL_ROOT="${1}"
REMOTE_USER="${2}"
REMOTE_IP="${3}"

for ds in $(zfs list -H -o name | \
    grep -E 'data/|default|john|usr/|var/|lib/' | \
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
{%endace%}

On remote I have a pre-znazendzetup script which makes sure the remote location exists.

{%ace edit=true, lang='sh'%}
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
{%endace%}

I would then run, for chin on ```replicator@<server ip>```.

{%ace edit=true, lang='sh'%}
./znapcfg "tank/replication/chin" "replicator" "<server ip>"
{%endace%}

### Scrub

Setup a monthly scrub. Easiest way to set this up as install the [systemd-zpool-scrub (AUR)](https://aur.archlinux.org/packages/systemd-zpool-scrub/) package.

{%ace edit=true, lang='sh'%}
pacaur -S systemd-zpool-scrub
systemctl enable --now zpool-scrub@vault.timer
{%endace%}

This could also easily set up by just installing a systemd unit containing the following.

{%ace edit=true, lang='sh'%}
nano /usr/lib/systemd/system/zpool-scrub@.service
{%endace%}

{%ace edit=true, lang='sh'%}
[Unit]
Description=Scrub ZFS Pool
Requires=zfs.target
After=zfs.target

[Service]
Type=oneshot
ExecStartPre=-/usr/bin/zpool scrub -s %i
ExecStart=/usr/bin/zpool scrub %i
{%endace%}

### Enable The ZFS Event Daemon

If an SMTP or MTA is configured, setup [The ZFS Event Daemon (ZED)](https://ramsdenj.com/2016/08/29/arch-linux-on-zfs-part-3-followup.html#zed-the-zfs-event-daemon)

{%ace edit=true, lang='sh'%}
nano /etc/zfs/zed.d/zed.rc
{%endace%}

Ad an email and mail program and set verbosity.

{%ace edit=true, lang='sh'%}
ZED_EMAIL_ADDR="root"
ZED_EMAIL_PROG="mail"
ZED_NOTIFY_VERBOSE=1
{%endace%}

Start and enable the daemon.

{%ace edit=true, lang='sh'%}
systemctl enable --now zfs-zed.service
{%endace%}

Start a scrub and check for an email.

{%ace edit=true, lang='sh'%}
zpool scrub vault
{%endace%}

## Define Hostid

[Define a hostid](https://ramsdenj.com/2016/06/23/arch-linux-on-zfs-part-2-installation.html#first-tasks) or problems arise at boot.

## S.M.A.R.T

Install [smartmontools](https://www.archlinux.org/packages/?name=smartmontools).

{%ace edit=true, lang='sh'%}
pacman -S smartmontools
{%endace%}

### Tests

Long or short tests can be run on a disk. A short test will check for device problems. The long test is just a short test plus complete disc surface examination.

Long test example:

{%ace edit=true, lang='sh'%}
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -t long /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -t long /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{%endace%}

Veiw results:

{%ace edit=true, lang='sh'%}
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -H /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -H /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{%endace%}

Or, veiw all test results.

{%ace edit=true, lang='sh'%}
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -l selftest /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -l selftest /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{%endace%}

Or detailed results.

{%ace edit=true, lang='sh'%}
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487
smartctl -a /dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657
smartctl -a /dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M
{%endace%}

### Daemon

The smartd daemon can also run, periodically running tests and will send you a message if a problem occurs.

Edit the configuration file at ```/etc/smartd.conf```.

{%ace edit=true, lang='sh'%}
nano /etc/smartd.conf
{%endace%}

To check for all errors on a disk use the option ```-a``` after the disk ID.

{%ace edit=true, lang='sh'%}
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657 -a -m <email>
/dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M -a -m <email>
{%endace%}

To test if your mail notification is working run a test, add ```-m <email address> -M test``` to the end of the config. This will run the test on the start of the daemon.:

{%ace edit=true, lang='sh'%}
DEVICESCAN -m <email address> -M test
{%endace%}

Start smartd:

{%ace edit=true, lang='sh'%}
systemctl start smartd
{%endace%}

My config looks like:

{%ace edit=true, lang='sh'%}
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_152271401093 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_154501401266 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402487 -a -m <email>
/dev/disk/by-id/ata-SanDisk_SDSSDXPS480G_164277402657 -a -m <email>
/dev/disk/by-id/ata-Samsung_SSD_840_EVO_250GB_S1DBNSADA75563M -a -m <email>
{%endace%}

## nfs


{%ace edit=true, lang='sh'%}
pacman -S nfs-utils
systemctl enable --now rpcbind.service nfs-client.target remote-fs.target
{%endace%}

Rpc has [a bug](https://bugs.archlinux.org/task/50663) caused by glibc, [until it's resolved force rpc.gssd to start](https://wiki.archlinux.org/index.php/NFS#Client).

{%ace edit=true, lang='sh'%}
systemctl edit rpc-gssd.service
{%endace%}

{%ace edit=true, lang='sh'%}
[Unit]
Requires=network-online.target
After=network-online.target

[Service]
Type=simple
ExecStart=
ExecStart=/usr/sbin/rpc.gssd -f
{%endace%}

## Autofs

Install [autofs](https://www.archlinux.org/packages/?name=autofs).

{%ace edit=true, lang='sh'%}
pacman -S autofs
{%endace%}

{%ace edit=true, lang='sh'%}
nano /etc/autofs/auto.master
{%endace%}

Add or uncomment the following.

{%ace edit=true, lang='sh'%}
/net    -hosts   --timeout=60
{%endace%}

Start and enable.

{%ace edit=true, lang='sh'%}
systemctl enable --now autofs
{%endace%}

## User Cache

I like to keep certain directories in tmpfs. It avoids extra writes to disk and can be faster since everything is stored in memory.

## Cleaning the cache

I like periodically have my users cache directory cleaned. This can easily be done using tmpfiles.d.

Create a new file in the ```/etc/tmpfiles.d``` directory.

{%ace edit=true, lang='sh'%}
nano /etc/tmpfiles.d/home-cache.conf
{%endace%}

Add a rule that will delete any file older than 10 days.

{%ace edit=true, lang='sh'%}
# remove files in /home/john/.cache older than 10 days
D /home/john/.cache 1755 john john 10d
{%endace%}
