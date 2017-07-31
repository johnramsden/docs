---
title: NixOS root on ZFS Install
sidebar: nixos_sidebar
hide_sidebar: false
keywords: nixos, linux, recovery, configuration, zfs
tags: [ nixos, linux, nixosconfig, zfs ]
permalink: nixos_install_zfs.html
toc: false
folder: linux/nixos/install
---

In order to import a ZFS pool, ZFS must be enabled in the NixOS configuration file.

Make sure zfs is in ```boot.supportedFilesystems```.

{% highlight shell %}
{ config, pkgs, ... }:

{
  imports = [ <nixpkgs/nixos/modules/installer/cd-dvd/installation-cd-graphical-kde.nix> ];
  boot.supportedFilesystems = [ "zfs" ];
}
{% endhighlight shell %}

Rebuild NixOS and switch to the new configuration.

{% highlight shell %}
nixos-rebuild switch
{% endhighlight shell %}

Check zfs is working,```modprobe zfs``` should show no problems.

ZFS should now work.

### Pool

Create a new pool or mount an existing pool.

#### Creating a pool

Create a pool using the disk ID and set it to 4k block size as default with ```ashift=12```.

{% highlight shell %}
ls -la /dev/disk/by-id/
zpool create -f -o ashift=12 vault /dev/disk/by-id/${DISKS}
{% endhighlight shell %}

Export the pool after creation.

{% highlight shell %}
zpool export ${POOLNAME}
{% endhighlight shell %}

#### Using an Existing pool

The existing pool assigning it to be relative to ```/mnt``` with ```-R```, the ```-N``` flag will tell ZFS not to mount any datasets.

{% highlight shell %}
zpool import -N -d /dev/disk/by-id -R /mnt vault
{% endhighlight shell %}

## Setup Datasets

Mount all datasets partitions to /mnt.

### Filesystem

{% highlight shell %}
NIX_ROOT=/mnt
ZFS_ROOT_DATASET=vault/sys/atom
ZFS_DATA_DATASET=vault/data
{% endhighlight shell %}

Setup datasets. Set all legacy.

{% highlight shell %}
zfs create -o mountpoint=none vault/sys
zfs create -o mountpoint=none ${ZFS_ROOT_DATASET}
zfs create -o mountpoint=none ${ZFS_ROOT_DATASET}/ROOT
zfs create -o mountpoint=legacy ${ZFS_ROOT_DATASET}/ROOT/default

# Rest of datasets...
{% endhighlight shell %}

## Mount Datasets

Mount the datasets:

{% highlight shell %}
mkdir ${NIX_ROOT}/nix;
mount -t zfs ${ZFS_ROOT_DATASET}/ROOT/default ${NIX_ROOT}

# Rest of datasets...
{% endhighlight shell %}

#### Boot

Create a 512M esp, mount to /boot

{% highlight shell %}
gdisk /dev/sdf

Command (? for help): n
Partition number (5-128, default 5):
First sector (34-488397134, default = 225445888) or {+-}size{KMGTP}:
Last sector (225445888-488397134, default = 488397134) or {+-}size{KMGTP}: +512
Hex code or GUID (L to show codes, Enter = 8300): ef00
Changed type of partition to 'EFI System'
{% endhighlight shell %}

Format boot and mount.

{% highlight shell %}
mkfs.fat -F32 /dev/sdf1
mkdir ${NIX_ROOT}/boot
mount /dev/sdf1 ${NIX_ROOT}/boot
{% endhighlight shell %}

#### Swap

Create a partition of desired size.

{% highlight shell %}
gdisk /dev/sdf

Command (? for help): n
Partition number (2-128, default 2):
First sector (34-488397134, default = 2099200) or {+-}size{KMGTP}:
Last sector (2099200-488397134, default = 488397134) or {+-}size{KMGTP}: +32G
Current type is 'Linux filesystem'
Hex code or GUID (L to show codes, Enter = 8300): 8200
Changed type of partition to 'Linux swap'
{% endhighlight shell %}

Enable swap.

{% highlight shell %}
mkswap /dev/sdf2

swapon /dev/sdf2
{% endhighlight shell %}

#### Install

Setup config in ```/mnt/etc/nixos``` and install.

```
nixos-install --root /mnt
```
