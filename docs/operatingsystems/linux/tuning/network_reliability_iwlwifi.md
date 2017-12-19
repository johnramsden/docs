---
title: Network Reliability With iwlwifi
category: [ linux-tuning, linux]
keywords: linux, tuning, sysctl
tags: [ tuning, linux, networking ]
---

My network keep dropping out using the iwlwifi driver, adding the following kernel parameters fixed the problem.

To get rid of "_iwlwifi 0000:03:00.0: DMA: Out of SW-IOMMU space for 4096 bytes_" errors I increased the buffer size.

{%ace edit=true, lang='sh'%}
swiotlb=32768
{%endace%}

I was getting the following PCI error.

{%ace edit=true, lang='sh'%}
kernel: pcieport 0000:00:1b.0: PCIe Bus Error: severity=Corrected, type=Physical Layer, id=00d8(Receiver ID)
kernel: pcieport 0000:00:1b.0:   device [8086:a167] error status/mask=00000001/00002000
kernel: pcieport 0000:00:1b.0:    [ 0] Receiver Error         (First)
{%endace%}

Turning off active power management got rid of the error.

{%ace edit=true, lang='sh'%}
pcie_aspm=off
{%endace%}
