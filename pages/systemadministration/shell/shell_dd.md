---
title: dd
sidebar: systemadministration_sidebar
hide_sidebar: false
keywords: shellscript, dd, shell, command
tags: [ shell, dd, command ]
permalink: shell_dd.html
toc: true
folder: systemadministration/shell
---

The following page contains uses for the ```dd``` command.

## Image a Disk

Using ```dd```, with disk sdX, create a gzipped image:

```
dd if=/dev/sdX conv=sync,noerror bs=64K | gzip -c  > /path/to/backup.img.gz
```

If fat32, split into volumes:

```
dd if=/dev/sdX conv=sync,noerror bs=64K | gzip -c | split -a3 -b2G - /path/to/backup.img.gz
```

Save the drive geometry.

```
fdisk -l /dev/sdX > /path/to/list_fdisk.info
```

To restore a system:

```
gunzip -c /path/to/backup.img.gz | dd of=/dev/sdX
```

Or, if it's been split:

```
cat /path/to/backup.img.gz* | gunzip -c | dd of=/dev/sdX
```
