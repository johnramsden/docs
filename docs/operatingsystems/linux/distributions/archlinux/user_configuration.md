---
title: Arch Linux User Configuration Management
sidebar: linux_sidebar
hide_sidebar: false
category: [ archlinux, linux ]
keywords: archlinux, linux, vcs, vcsh, mr, myrepos
tags: [ archlinux, linux, vcs, postinstall ]
permalink: linux_archlinux_user_config.html
toc: true
folder: linux/archlinux
---

To keep my home orgamized I use [vcsh](https://github.com/RichiH/vcsh/blob/master/doc/README.md) and [myrepos](http://myrepos.branchable.com/).

## Setup

On a new system, install the requirements.

{%ace edit=true, lang='sh'%}
pacaur -S myrepos vcsh
{%endace%}

Clone an existing myrepos configuration from a users ```$HOME```.

{%ace edit=true, lang='sh'%}
vcsh clone git@github.com:johnramsden/mr.git
{%endace%}

To clone a branch:

Clone an existing myrepos configuration from a users ```$HOME```.

{%ace edit=true, lang='sh'%}
vcsh clone -b branch git@github.com:johnramsden/mr.git
{%endace%}

Or the [vcsh template](https://github.com/RichiH/vcsh_mr_template) for a new setup.

{%ace edit=true, lang='sh'%}
vcsh clone git@github.com:RichiH/vcsh_mr_template.git mr
{%endace%}

It tracks the myrepos config.

{%ace edit=true, lang='sh'%}
cat ~/.mrconfig
{%endace%}

{%ace edit=true, lang='sh'%}
[DEFAULT]
git_gc = git gc "$@"
jobs = 5

include = cat ~/.config/mr/config.d/*
{%endace%}

and myrepos template config.

{%ace edit=true, lang='sh'%}
cat ~/.config/mr/available.d/mr.vcsh
{%endace%}

{%ace edit=true, lang='sh'%}
[$HOME/.config/vcsh/repo.d/mr.git]
checkout = vcsh clone git://github.com/RichiH/vcsh_mr_template.git mr
{%endace%}

The templates are stored in ```$HOME/.config/mr/available.d``` and can be changed to point to your own myrepos config.

## Usage

After adding a config for all your repos in ```~/.config/mr/available.d/```, symlink the ones you want enabled to ```~/.config/mr/config.d/```.

To enable the mr config.

{%ace edit=true, lang='sh'%}
cd ~/.config/mr/config.d
ln -s ../available.d/mr.vcsh
{%endace%}

Now, run ```mr up``` to clone the specified repos.

## Setup SSH

To start ssh-agent with a systemd unit create ```~/.config/systemd/user/ssh-agent.service```.

{%ace edit=true, lang='sh'%}
nano ~/.config/systemd/user/ssh-agent.service
{%endace%}

{%ace edit=true, lang='sh'%}
[Unit]
Description=SSH key agent

[Service]
Type=simple
Environment=SSH_AUTH_SOCK=%t/ssh-agent.socket
ExecStart=/usr/bin/ssh-agent -D -a $SSH_AUTH_SOCK

[Install]
WantedBy=default.target
{%endace%}

Add ```SSH_AUTH_SOCK DEFAULT="${XDG_RUNTIME_DIR}/ssh-agent.socket"``` to ```~/.pam_environment```

Start and anable.

{%ace edit=true, lang='sh'%}
systemctl --user enable --now ssh-agent
{%endace%}
