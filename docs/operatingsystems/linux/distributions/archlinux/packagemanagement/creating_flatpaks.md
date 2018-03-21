---
title: Creating flatpaks
tags: [ archlinux, linux ]
---

# Creating flatpaks

Install flatpak.

Add flathub and install SDK and runtime.

{%ace edit=true, lang='sh'%}
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak --user install flathub org.freedesktop.Sdk
flatpak --user install flathub org.freedesktop.Platform
{%endace%}

Setup build.

{%ace edit=true, lang='sh'%}
mkdir build && cd build
flatpak build-init diablo3 ca.johnramsden.diablo3 org.freedesktop.Sdk org.freedesktop.Platform
{%endace%}
