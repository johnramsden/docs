---
title: libvirt
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, virtualization, libvirt, kvm, qemu
tags: [ archlinux, linux, virtualization ]
permalink: archlinux_libvirt.html
toc: true
folder: linux/archlinux
---

## libvirt

Setup [libvirt](https://wiki.archlinux.org/index.php/Libvirt).

### Libvirt ZFS Dataset

To keep my libvirt setup outside of any boot environments I give them their own dataset.

{% highlight shell %}
zfs create -o mountpoint=legacy vault/sys/chin/var/lib/libvirt
mkdir /var/lib/libvirt
mount -t zfs vault/sys/chin/var/lib/libvirt /var/lib/libvirt
{% endhighlight shell %}

Add to fstab

{% highlight shell %}
nano /etc/fstab
{% endhighlight shell %}

{% highlight shell %}
vault/sys/chin/var/lib/libvirt            /var/lib/lxc                    zfs       rw,relatime,xattr,noacl     0 0
{% endhighlight shell %}

### Kernel

Check modules are loaded.

{% highlight shell %}
lsmod | grep kvm
lsmod | grep virtio
{% endhighlight shell %}

If blank, [load them explicitly](https://wiki.archlinux.org/index.php/Kernel_modules#Manual_module_handling).

{% highlight shell %}
echo "virtio" > /etc/modules-load.d/virtio.conf
{% endhighlight shell %}

Install the dependencies.

*   [libvirt](https://www.archlinux.org/packages/?name=libvirt)
*   KVM/QEMU
    *   [qemu-headless](https://www.archlinux.org/packages/?name=qemu-headless)
*   Network
    *   Nat/DHCP
        *   [ebtables](https://www.archlinux.org/packages/?name=ebtables)
        *   [dnsmasq](https://www.archlinux.org/packages/?name=dnsmasq)
    *   bridged networking
        *   [bridge-utils](https://www.archlinux.org/packages/?name=)
*   UEFI
    *   [ovmf](https://www.archlinux.org/packages/?name=ovmf)
*   Frontends
    *   [virt-manager](https://www.archlinux.org/packages/?name=virt-manager)
    *   [virt-viewer](https://www.archlinux.org/packages/?name=virt-viewer)

{% highlight shell %}
pacman -S libvirt qemu-headless ebtables dnsmasq bridge-utils virt-manager virt-viewer ovmf
{% endhighlight shell %}

### ZVOL Backing Store

I like to use ZFS ZVOL's as my backing store.

#### Setup

Create a dataset for ZVOLs:

{% highlight shell %}
zfs create -o mountpoint=none vault/zvols
{% endhighlight shell %}

##### User ZVOLs

Create a dataset for user 'john''s ZVOLs

{% highlight shell %}
zfs create -o mountpoint=none vault/zvols/john
{% endhighlight shell %}

As of [zfsonlinux 0.7.0](https://github.com/zfsonlinux/zfs/releases/tag/zfs-0.7.0) ZFS delegation using ```zfs allow``` works on linux. Delegate permissions giving the abiity to snapshot and create datasets.

{% highlight shell %}
zfs allow john create,mount,mountpoint,snapshot vault/zvols/john
{% endhighlight shell %}

#### Create ZVOL

Try [Turn off Windows write-cache buffer flushing](https://forums.servethehome.com/index.php?threads/performance-of-kvm-qemu-disks-on-zfs-volumes.12550/)
Make sure that [volblocksize is the same as the guest FS block size](http://list.zfsonlinux.org/pipermail/zfs-discuss/2016-February/024682.html)

use

*   primarycache=metadata - Let guest do its own caching.

Create ZVOL for a new VM. Replace <new VM> with name. Volumes still need to be created by root.

{% highlight shell %}
zfs create -o mountpoint=none vault/zvols/john/libvirt
zfs create -V 50G vault/zvols/john/libvirt/<new VM> -o primarycache=metadata -o compression=on
{% endhighlight shell %}
