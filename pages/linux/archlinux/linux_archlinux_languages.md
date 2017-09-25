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


{% highlight shell %}
PATH="$(ruby -e 'print Gem.user_dir')/bin:${PATH}"
{% endhighlight shell %}

On Arch user gems will be installed to ```~/.gem/ruby/``` so they don't interact with anything installed by Pacman.

### Bundler

Install bundler with.

{% highlight shell %}
gem install bundler
{% endhighlight shell %}

Bundler by default installs gems system-wide. To change this default add the following to your shell rc.

{% highlight shell %}
export GEM_HOME=$(ruby -e 'print Gem.user_dir')
{% endhighlight shell %}

Bundles can be installed explicitly at a certain location using:

{% highlight shell %}
bundle install --path .bundle
{% endhighlight shell %}

This would install a bundle in the working directory inside of a .bundle directory.

## Node.js

Arch Wiki: [nodejs](https://wiki.archlinux.org/index.php/Node.js)

Install the [nodejs](https://www.archlinux.org/packages/?name=nodejs) package.

To set up nodejs to store packages in working directories, add the following to your shell rc.

{% highlight shell %}
export npm_config_prefix=${HOME}/.node_modules
PATH="${HOME}/.node_modules/bin:${PATH}"
{% endhighlight shell %}
