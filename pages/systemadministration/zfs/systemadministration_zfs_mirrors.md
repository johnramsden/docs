---
title: ZFS Mirrors
sidebar: systemadministration_sidebar
hide_sidebar: false
category: [ zfs, systemadministration ]
keywords: zfs
permalink: systemadministration_zfs_mirrors.html
toc: true
folder: systemadministration/zfs
---

Creating a mirrored ZFS pool is easy.

## Two disk mirror

To create a single two disk mirror:

{% highlight shell %}
zpool create -f -o ashift=12 vault mirror \
                ata-SanDisk_SDSSDXPS480G_152271401093 \
                ata-SanDisk_SDSSDXPS480G_154501401266
{% endhighlight shell %}

## Four disk mirror - RAID10

To create a RAID10 style pool, create multiple mirrors. As many mirrors as desired can be added.

{% highlight shell %}
zpool create -f -o ashift=12 vault \
              mirror \
                ata-SanDisk_SDSSDXPS480G_152271401093 \
                ata-SanDisk_SDSSDXPS480G_154501401266 \
              mirror \
                ata-SanDisk_SDSSDXPS480G_164277402487 \
                ata-SanDisk_SDSSDXPS480G_164277402657
{% endhighlight shell %}

This created the following.

{% highlight shell %}
zpool status

  pool: vault
 state: ONLINE
  scan: none requested
config:

	NAME                                       STATE     READ WRITE CKSUM
	vault                                      ONLINE       0     0     0
	  mirror-0                                 ONLINE       0     0     0
	    ata-SanDisk_SDSSDXPS480G_152271401093  ONLINE       0     0     0
	    ata-SanDisk_SDSSDXPS480G_154501401266  ONLINE       0     0     0
	  mirror-1                                 ONLINE       0     0     0
	    ata-SanDisk_SDSSDXPS480G_164277402487  ONLINE       0     0     0
	    ata-SanDisk_SDSSDXPS480G_164277402657  ONLINE       0     0     0

errors: No known data errors
{% endhighlight shell %}
