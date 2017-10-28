---
title: NixOS root on ZFS Install
sidebar: linux_sidebar
hide_sidebar: false
category: [ nixos, linux]
keywords: nixos, linux, recovery, configuration, zfs
tags: [ nixos, linux, nixosconfig, zfs ]
permalink: linux_nixos_install_zfs.html
toc: false
folder: linux/nixos/install
---

In order to import a ZFS pool, ZFS must be enabled in the NixOS configuration file.

Make sure zfs is in ```boot.supportedFilesystems```.

{%ace edit=true, lang='sh'%}
{ config, pkgs, ... }:

{
  imports = [ <nixpkgs/nixos/modules/installer/cd-dvd/installation-cd-graphical-kde.nix> ];
  boot.supportedFilesystems = [ "zfs" ];
}
{%endace%}

Rebuild NixOS and switch to the new configuration.

{%ace edit=true, lang='sh'%}
nixos-rebuild switch
{%endace%}

Check zfs is working,```modprobe zfs``` should show no problems.

ZFS should now work.

### Pool

Create a new pool or mount an existing pool.

#### Creating a pool

Create a pool using the disk ID and set it to 4k block size as default with ```ashift=12```.

{%ace edit=true, lang='sh'%}
ls -la /dev/disk/by-id/
zpool create -f -o ashift=12 vault /dev/disk/by-id/${DISKS}
{%endace%}

Export the pool after creation.

{%ace edit=true, lang='sh'%}
zpool export ${POOLNAME}
{%endace%}

#### Using an Existing pool

The existing pool assigning it to be relative to ```/mnt``` with ```-R```, the ```-N``` flag will tell ZFS not to mount any datasets.

{%ace edit=true, lang='sh'%}
zpool import -N -d /dev/disk/by-id -R /mnt vault
{%endace%}

## Setup Datasets

Mount all datasets partitions to /mnt.

### Filesystem

{%ace edit=true, lang='sh'%}
NIX_ROOT=/mnt
ZFS_ROOT_DATASET=vault/sys/atom
ZFS_DATA_DATASET=vault/data
{%endace%}

Setup datasets. Set all legacy.

{%ace edit=true, lang='sh'%}
zfs create -o mountpoint=none vault/sys
zfs create -o mountpoint=none ${ZFS_ROOT_DATASET}
zfs create -o mountpoint=none ${ZFS_ROOT_DATASET}/ROOT
zfs create -o mountpoint=legacy ${ZFS_ROOT_DATASET}/ROOT/default

# Rest of datasets...
{%endace%}

## Mount Datasets

Mount the datasets:

{%ace edit=true, lang='sh'%}
mkdir ${NIX_ROOT}/nix;
mount -t zfs ${ZFS_ROOT_DATASET}/ROOT/default ${NIX_ROOT}

# Rest of datasets...
{%endace%}

#### Boot

Create a 512M esp, mount to /boot

{%ace edit=true, lang='sh'%}
gdisk /dev/sdf

Command (? for help): n
Partition number (5-128, default 5):
First sector (34-488397134, default = 225445888) or {+-}size{KMGTP}:
Last sector (225445888-488397134, default = 488397134) or {+-}size{KMGTP}: +512
Hex code or GUID (L to show codes, Enter = 8300): ef00
Changed type of partition to 'EFI System'
{%endace%}

Format boot and mount.

{%ace edit=true, lang='sh'%}
mkfs.fat -F32 /dev/sdf1
mkdir ${NIX_ROOT}/boot
mount /dev/sdf1 ${NIX_ROOT}/boot
{%endace%}

#### Swap

Create a partition of desired size.

{%ace edit=true, lang='sh'%}
gdisk /dev/sdf

Command (? for help): n
Partition number (2-128, default 2):
First sector (34-488397134, default = 2099200) or {+-}size{KMGTP}:
Last sector (2099200-488397134, default = 488397134) or {+-}size{KMGTP}: +32G
Current type is 'Linux filesystem'
Hex code or GUID (L to show codes, Enter = 8300): 8200
Changed type of partition to 'Linux swap'
{%endace%}

Enable swap.

{%ace edit=true, lang='sh'%}
mkswap /dev/sdf2

swapon /dev/sdf2
{%endace%}

#### Install

Setup config in ```/mnt/etc/nixos``` and install.

```
nixos-install --root /mnt
```
