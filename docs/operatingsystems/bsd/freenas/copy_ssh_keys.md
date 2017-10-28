---
title: Copy SSH Keys off FreeNAS
sidebar: bsd_sidebar
hide_sidebar: false
category: [ bsd, freenas ]
keywords: freebsd, bsd, freenas, ssh
tags: [ freebsd, freenas, bsd ]
permalink: bsd_freenas_copy_ssh_keys.html
toc: false
folder: bsd/freenas
---

To copy ssh keys using ```ssh-copy-id``` off of FreeNAS an ```ssh-agent``` needs to be started . On FreeNAS run.

{%ace edit=true, lang='sh'%}
sh
eval `ssh-agent -s`
{%endace%}

Then send any keys to a remote server.

{%ace edit=true, lang='sh'%}
ssh-copy-id <user>@<ip address>
{%endace%}
