---
title: Surface Pro 4 Power Tuning
tags: [ tuning, linux ]
---

## {{ page.title }}

### Audio

[Idle audio card](https://wiki.archlinux.org/index.php/Power_management#Audio) after one second:

{%ace lang='sh'%}
echo "options snd_hda_intel power_save=1" | tee /etc/modprobe.d/audio_powersave.conf
{%endace%}

### Kernel Tuning

[Disable NMI watchdog](https://wiki.archlinux.org/index.php/Power_management#Disabling_NMI_watchdog). It can generate a lot of interrupts, causing a noticeable increase in power usage.

{%ace lang='sh'%}
echo "kernel.nmi_watchdog = 0" | tee /etc/sysctl.d/disable_watchdog.conf
{%endace%}


### References

*   [Arch Wiki](https://wiki.archlinux.org)
    *   [Powertop](https://wiki.archlinux.org/index.php/Powertop)
    *   [Power Management](https://wiki.archlinux.org/index.php/Power_management#Power_management_with_systemd)
