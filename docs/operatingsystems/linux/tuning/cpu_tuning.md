---
title: CPU Tuning
category: [ linux-tuning, linux]
keywords: linux, tuning, limits
tags: [ tuning, linux ]
folder: linux/tuning
---

# CPU Tuning

## intel_pstate

To disable turbo, set a udev rule to set `cpu/intel_pstate/no_turbo` to `1`:

{%ace edit=true, lang='sh'%}
nano /etc/udev/rules.d/50-set_intel_pstate_no_turbo.rules
{%endace%}

{%ace edit=true, lang='sh'%}
KERNEL=="cpu",RUN+="/bin/sh -c 'echo -n 1 > /sys/devices/system/cpu/intel_pstate/no_turbo'"
{%endace%}

