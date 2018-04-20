---
title: Language Configuration
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, ruby, nodejs
tags: [ archlinux, linux, postinstall ]
permalink: linux_archlinux_languages.html
toc: true
folder: linux/archlinux
---

## Ruby

Arch Wiki: [ruby](https://wiki.archlinux.org/index.php/ruby)

Install the [ruby](https://www.archlinux.org/packages/?name=ruby) package.

Add ruby gem path to shell rc, ie ```~/.zshrc```, or ```~/.bashrc```.


{%ace lang='sh'%}
PATH="$(ruby -e 'print Gem.user_dir')/bin:${PATH}"
{%endace%}

On Arch user gems will be installed to ```~/.gem/ruby/``` so they don't interact with anything installed by Pacman.

### Bundler

Install bundler with.

{%ace lang='sh'%}
gem install bundler
{%endace%}

Bundler by default installs gems system-wide. To change this default add the following to your shell rc.

{%ace lang='sh'%}
export GEM_HOME=$(ruby -e 'print Gem.user_dir')
{%endace%}

Bundles can be installed explicitly at a certain location using:

{%ace lang='sh'%}
bundle install --path .bundle
{%endace%}

This would install a bundle in the working directory inside of a .bundle directory.

## Node.js

Arch Wiki: [nodejs](https://wiki.archlinux.org/index.php/Node.js)

Install the [nodejs](https://www.archlinux.org/packages/?name=nodejs) package.

To set up nodejs to store packages in working directories, add the following to your shell rc.

{%ace lang='sh'%}
export npm_config_prefix=${HOME}/.node_modules
PATH="${HOME}/.node_modules/bin:${PATH}"
{%endace%}
