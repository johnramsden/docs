---
title: find
sidebar: systemadministration_sidebar
hide_sidebar: false
category: [ shell, systemadministration ]
keywords: shellscript, find, shell
tags: [ shell, find, command ]
permalink: systemadministration_shell_find.html
toc: true
folder: systemadministration/shell
---

This is a compilation of useful ways to use the ```find``` command.

## Delete from Extension

Delete all files with the 'jpeg' extension.

```
find . -type f -name '*.jpeg' -delete
```
