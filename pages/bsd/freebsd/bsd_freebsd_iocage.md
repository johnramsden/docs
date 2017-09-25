---
title: iocage
sidebar: bsd_sidebar
hide_sidebar: false
keywords: freebsd, bsd, iocage, containerization
tags: [ freebsd, bsd, containerization ]
permalink: bsd_freebsd_iocage.html
toc: false
folder: bsd/freebsd
---

I've been using the new python rewrite of the jail manager [iocage],(https://github.com/iocage/iocage) for FreeBSD, and since it's still in rapid development there have been a lot of new changes and bug fixes. A [few of which](https://github.com/iocage/iocage/issues?utf8=%E2%9C%93&q=is%3Aissue%20author%3Ajohnramsden) have been my own. Since releases aren't put out with every update I decided it would be a good idea to run from [the master branch](https://github.com/iocage/iocage).

Since I didn't feel like polluting my system with user install python packages that weren't being managed by the package manager, I thought it would be a good idea to install them into a [virtual environment](https://docs.python.org/3/tutorial/venv.html). It seems to have worked well so far.

## Install From git in a virtualenv

Create ```/usr/local/opt/iocage```, install requirements and download source.

{% highlight shell %}
pkg update && pkg upgrade && pkg install python36 libgit2 git # Or git-lite
mkdir -p /usr/local/opt/iocage
git clone --recursive https://github.com/iocage/iocage
{% endhighlight shell %}

Enter source directory, create a venv for the install..

{% highlight shell %}
cd iocage
python3.6 -m venv venv
{% endhighlight shell %}

Enter the venv and install.

{% highlight shell %}
source venv/bin/activate
make install
deactivate
{% endhighlight shell %}

Symlink the script to ```/usr/local/bin/```.

{% highlight shell %}
ln -s /usr/local/opt/iocage/iocage/venv/bin/iocage /usr/local/bin/iocage
{% endhighlight shell %}

And test:

{% highlight shell %}
iocage --version
{% endhighlight shell %}

{% highlight shell %}
Version 0.9.9.2 RC
{% endhighlight shell %}
