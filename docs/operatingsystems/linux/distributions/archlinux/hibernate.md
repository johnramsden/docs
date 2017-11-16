---
title: Hibernate
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux, postinstall ]
---

# Hibernate

First set up swap.

[Next](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate#Required_kernel_parameters) add ```resume=swap_partition``` to kernel parameters.

For example, with UUID add:

{%ace edit=true, lang='sh'%}
resume=UUID=8a1aac0b-487d-48d5-a683-417031d5098a
{%endace%}

## Initramfs

If using the base hook, add resume after the udev hook in ```/etc/mkinitcpio.conf```:

```
HOOKS="base udev resume autodetect modconf block filesystems keyboard fsck"
```

If using the systemd hook, resume isn't needed.
