---
title: Arch Linux User Configuration Management
sidebar: linux_sidebar
hide_sidebar: false
keywords: archlinux, linux, vcs, vcsh, mr, myrepos
tags: [ archlinux, linux, vcs, postinstall ]
permalink: archlinux_user_config.html
toc: true
folder: linux/archlinux
---

To keep my home orgamized I use [vcsh](https://github.com/RichiH/vcsh/blob/master/doc/README.md) and [myrepos](http://myrepos.branchable.com/).

## Setup

On a new system, install the requirements.

{% highlight shell %}
pacaur -S myrepos vcsh
{% endhighlight shell %}

Clone an existing myrepos configuration from a users ```$HOME```.

{% highlight shell %}
vcsh clone git@github.com:johnramsden/mr.git
{% endhighlight shell %}

To clone a branch:

Clone an existing myrepos configuration from a users ```$HOME```.

{% highlight shell %}
vcsh clone -b <wooly> git@github.com:johnramsden/mr.git
{% endhighlight shell %}

Or the [vcsh template](https://github.com/RichiH/vcsh_mr_template) for a new setup.

{% highlight shell %}
vcsh clone git@github.com:RichiH/vcsh_mr_template.git mr
{% endhighlight shell %}

It tracks the myrepos config.

{% highlight shell %}
cat ~/.mrconfig
{% endhighlight shell %}

{% highlight shell %}
[DEFAULT]
git_gc = git gc "$@"
jobs = 5

include = cat ~/.config/mr/config.d/*
{% endhighlight shell %}

and myrepos template config.

{% highlight shell %}
cat ~/.config/mr/available.d/mr.vcsh
{% endhighlight shell %}

{% highlight shell %}
[$HOME/.config/vcsh/repo.d/mr.git]
checkout = vcsh clone git://github.com/RichiH/vcsh_mr_template.git mr
{% endhighlight shell %}

The templates are stored in ```$HOME/.config/mr/available.d``` and can be changed to point to your own myrepos config.

## Usage

After adding a config for all your repos in ```~/.config/mr/available.d/```, symlink the ones you want enabled to ```~/.config/mr/config.d/```.

To enable the mr config.

{% highlight shell %}
cd ~/.config/mr/config.d
ln -s ../available.d/mr.vcsh
{% endhighlight shell %}

Now, run ```mr up``` to clone the specified repos.
