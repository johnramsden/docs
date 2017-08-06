---
title: ZFS Dataset Structure on Arch Linux
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, zfs
tags: [ archlinux, linux, zfs ]
permalink: archlinux_zfs_structure.html
toc: true
folder: linux/archlinux
---

After a lot of experimenting, as of August 2nd 2017 I was using the following filesystem heirarchy for my ZFS datasets during system setup when using Arch.

## Dataset Structure

I use a few variables to represent different locations in the pool for datasets.

*   ```SYS_ROOT=vault/sys``` - The location of any systems on the pool.
*   ```DATA_ROOT=vault/data``` - System shared data.

## Boot Environments

For boot environments I use (where SYSTEM_NAME can be anything, I use the hostname):

{% highlight shell %}
${SYS_ROOT}/${SYSTEM_NAME}/ROOT/${BOOT_ENV}
{% endhighlight shell %}

For example, my current boot environment ```/```:

{% highlight shell %}
vault/sys/chin/ROOT/default
{% endhighlight shell %}

## Datasets Created

While only a dataset for ```/``` really needs creating, I create quite a few. This lets me backup and snapshot only datasets for areas I need.

Setup datasets. Set all besides ```/``` legacy, or use zfs management. I like using legacy for multi system setups using a shared pool, and zfs for single install systems.

### Boot environment Dataset

The boot environment will be mounted to ```/``` and store everything that doesnt have it's own mounted dataset.

{% highlight shell %}
zfs create -o mountpoint=none ${SYS_ROOT}; \
zfs create -o mountpoint=none ${SYS_ROOT}/${SYSTEM_NAME}; \
zfs create -o mountpoint=none ${SYS_ROOT}/${SYSTEM_NAME}/ROOT; \
zfs create -o mountpoint=/ ${SYS_ROOT}/${SYSTEM_NAME}/ROOT/${BOOT_ENV}
{% endhighlight shell %}


#### canmount=off Datasets

Set ```/var```, ```/var/lib``` and ```/usr``` to ```canmount=off``` meaning they're not mounted and are only there to create the directory structure. This will put their data in the boot environment dataset.' Their properties will be inherited.

{% highlight shell %}
zfs create -o canmount=off -o mountpoint=/var -o xattr=sa ${SYS_ROOT}/${SYSTEM_NAME}/var; \
zfs create -o canmount=off -o mountpoint=/var/lib ${SYS_ROOT}/${SYSTEM_NAME}/var/lib; \
zfs create -o canmount=off -o mountpoint=/var/lib/systemd ${SYS_ROOT}/${SYSTEM_NAME}/var/lib/systemd; \
zfs create -o canmount=off -o mountpoint=/usr ${SYS_ROOT}/${SYSTEM_NAME}/usr
{% endhighlight shell %}

### Regular Datasets

The other datasets will be independent from the boot environment and will not change between boot environments.

#### System Datasets

I keep some datasets like ```/var/cache```'s' dataset seperate to avoid having to snapshot and backup their data. I also keep ```/var/log``` 's' dataset seperate so the logs are always available as well as the datasets for my containers and VMs.

{% highlight shell %}
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/lib/systemd/coredump; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/log; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/lib/lxc; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/lib/lxd; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/lib/machines; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/var/cache; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/usr/local
{% endhighlight shell %}

#### User Datasets

I create extensive user datasets, outside the boot environment.

{% highlight shell %}
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home/john; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home/john/local; \
zfs create -o mountpoint=/home/john/.local/share -o canmount=off ${SYS_ROOT}/${SYSTEM_NAME}/home/john/local/share; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home/john/local/share/Steam; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home/john/config; \
zfs create -o mountpoint=legacy ${SYS_ROOT}/${SYSTEM_NAME}/home/john/cache
{% endhighlight shell %}

As of [zfsonlinux 0.7.0](https://github.com/zfsonlinux/zfs/releases/tag/zfs-0.7.0) ZFS delegation using ```zfs allow``` works on linux. I delegate all datasets under ```${SYS_ROOT}/${SYSTEM_NAME}/home/john``` to my user 'john' giving the abiity to snapshot and create datasets.

{% highlight shell %}
zfs allow john create,mount,mountpoint,snapshot ${SYS_ROOT}/${SYSTEM_NAME}/home/john
{% endhighlight shell %}

Checking permissions shows john's can permissions.

{% highlight shell %}
zfs allow ${SYS_ROOT}/${SYSTEM_NAME}/home/john
{% endhighlight shell %}

{% highlight shell %}
---- Permissions on vault/sys/chin/home/john -------------------------
Local+Descendent permissions:
        user john create
[root@chin ~]# zfs allow john snapshot ${SYS_ROOT}/${SYSTEM_NAME}/home/john
[root@chin ~]# zfs allow ${SYS_ROOT}/${SYSTEM_NAME}/home/john
---- Permissions on vault/sys/chin/home/john -------------------------
Local+Descendent permissions:
        user john create,snapshot
{% endhighlight shell %}

#### Data Datasets

I'll be mounting these under ```${HOME}```. They exist outside the different systems and are shared between them.

{% highlight shell %}
zfs create -o mountpoint=none ${DATA_ROOT}; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Books; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Computer; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Personal; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Pictures; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/University; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Workspace; \
zfs create -o mountpoint=legacy ${DATA_ROOT}/Reference
{% endhighlight shell %}

## Final Structure

So my system ends up as.

{% highlight shell %}
zfs list -o name | grep -E 'chin|data'

vault/data                                   768K   860G    96K  none
vault/data/Books                              96K   860G    96K  legacy
vault/data/Computer                           96K   860G    96K  legacy
vault/data/Personal                           96K   860G    96K  legacy
vault/data/Pictures                           96K   860G    96K  legacy
vault/data/Reference                          96K   860G    96K  legacy
vault/data/University                         96K   860G    96K  legacy
vault/data/Workspace                          96K   860G    96K  legacy
vault/sys/chin                              1.97M   860G    96K  none
vault/sys/chin/ROOT                          192K   860G    96K  none
vault/sys/chin/ROOT/default                   96K   860G    96K  /
vault/sys/chin/home                          672K   860G    96K  legacy
vault/sys/chin/home/john                     576K   860G    96K  legacy
vault/sys/chin/home/john/cache                96K   860G    96K  legacy
vault/sys/chin/home/john/config               96K   860G    96K  legacy
vault/sys/chin/home/john/local               288K   860G    96K  legacy
vault/sys/chin/home/john/local/share         192K   860G    96K  /home/john/.local/share
vault/sys/chin/home/john/local/share/Steam    96K   860G    96K  legacy
vault/sys/chin/usr                           192K   860G    96K  /usr
vault/sys/chin/usr/local                      96K   860G    96K  legacy
vault/sys/chin/var                           864K   860G    96K  /var
vault/sys/chin/var/cache                      96K   860G    96K  legacy
vault/sys/chin/var/lib                       576K   860G    96K  /var/lib
vault/sys/chin/var/lib/lxc                    96K   860G    96K  legacy
vault/sys/chin/var/lib/lxd                    96K   860G    96K  legacy
vault/sys/chin/var/lib/machines               96K   860G    96K  legacy
vault/sys/chin/var/lib/systemd               192K   860G    96K  /var/lib/systemd
vault/sys/chin/var/lib/systemd/coredump       96K   860G    96K  legacy
vault/sys/chin/var/log                        96K   860G    96K  legacy
{% endhighlight shell %}

## Install Perperation

Using this structure datasets must be mounted in the correct order.

### ZFS Setup

Import zpool and mount root dataset:

{% highlight shell %}
zpool import -d /dev/disk/by-id -R /mnt vault
mount -t zfs vault/sys/chin/ROOT/default /mnt
{% endhighlight shell %}

After dataset creation, create cachefile.

{% highlight shell %}
zpool set cachefile=/etc/zfs/zpool.cache vault
mkdir -p /mnt/etc/zfs && cp /etc/zfs/zpool.cache /mnt/etc/zfs/zpool.cache
{% endhighlight shell %}

Mount system datasets:

{% highlight shell %}
mkdir -p /mnt/usr/local
mount -t zfs vault/sys/chin/usr/local /mnt/usr/local; \

mkdir -p /mnt/var/cache
mount -t zfs vault/sys/chin/var/cache /mnt/var/cache; \


mkdir -p /mnt/var/lib/{lxc,lxd,machines,systemd/coredump} /mnt/var/log; \
mount -t zfs vault/sys/chin/var/lib/lxc /mnt/var/lib/lxc; \
mount -t zfs vault/sys/chin/var/lib/lxd /mnt/var/lib/lxd; \
mount -t zfs vault/sys/chin/var/lib/machines /mnt/var/lib/machines; \
mount -t zfs vault/sys/chin/var/lib/systemd/coredump /mnt/var/lib/systemd/coredump; \
mount -t zfs vault/sys/chin/var/log /mnt/var/log; \
{% endhighlight shell %}

Mount home.

{% highlight shell %}
mkdir -p /mnt/home ; \
mount -t zfs vault/sys/chin/home /mnt/home; \

mkdir -p /mnt/home/john
mount -t zfs vault/sys/chin/home/john /mnt/home/john; \

mkdir -p /mnt/home/john/{.cache,.config,.local}
mount -t zfs vault/sys/chin/home/john/cache /mnt/home/john/.cache; \
mount -t zfs vault/sys/chin/home/john/config /mnt/home/john/.config; \
mount -t zfs vault/sys/chin/home/john/local /mnt/home/john/.local; \

mkdir -p /mnt/home/john/.local/share/Steam
mount -t zfs vault/sys/chin/home/john/local/share/Steam /mnt/home/john/.local/share/Steam; \
{% endhighlight shell %}

Mount data:

{% highlight shell %}
mkdir -p /mnt/home/john/{Books,Computer,Personal,Pictures,Reference,University,Workspace}
mount -t zfs vault/data/Books /mnt/home/john/Books; \
mount -t zfs vault/data/Computer /mnt/home/john/Computer; \
mount -t zfs vault/data/Personal /mnt/home/john/Personal; \
mount -t zfs vault/data/Pictures /mnt/home/john/Pictures; \
mount -t zfs vault/data/Reference /mnt/home/john/Reference; \
mount -t zfs vault/data/University /mnt/home/john/University; \
mount -t zfs vault/data/Workspace /mnt/home/john/Workspace; \
{% endhighlight shell %}

### Boot Setup

Create esp, (EF00) for regular install.

{% highlight shell %}
gdisk /dev/sdf
mkfs.fat -F32 /dev/sdf1
mount /dev/sdf1 /mnt/boot
{% endhighlight shell %}

I keep it at ```/mnt/efi``` instead, and [bindmount kernel directory to /boot](https://ramsdenj.com/2016/04/15/multi-boot-linux-with-one-boot-partition.html).

{% highlight shell %}
mkdir -p /mnt/mnt/efi
mount /dev/sdf1 /mnt/mnt/efi
{% endhighlight shell %}


{% highlight shell %}
mkdir -p /mnt/boot /mnt/mnt/efi/installs/chin
mount --bind /mnt/mnt/efi/installs/chin /mnt/boot
{% endhighlight shell %}

### Swap

Create 32GiB partition and create swap.

{% highlight shell %}
mkswap /dev/sdf2
swapon /dev/sdf2
{% endhighlight shell %}

### fstab Configuration

Create fstab, adding all currently mounted filesystems.

{% highlight shell %}
genfstab -U -p /mnt >> /mnt/etc/fstab
{% endhighlight shell %}

Get swap UUID and add to fstab.

{% highlight shell %}
lsblk -no UUID /dev/sdf2
{% endhighlight shell %}

{% highlight shell %}
UUID=4b00ce42-d400-4060-9329-622c420f367e none swap defaults 0 0
{% endhighlight shell %}

Now all partitions and datasets should be setup, check that the fstab looks correct.
