---
title: Useful Commands and Scripts
sidebar: home_sidebar
hide_sidebar: true
keywords: shellscript, dd, find
tags: [ shell, dd, find ]
permalink: shell_useful_commands.html
toc: true
folder: shell
---

This is a compilation of useful commands find myself often using, and would like to remember.

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



## Find

Delete all based on an extension.

```
find . -type f -name '*.jpeg' -delete
```
