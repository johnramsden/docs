---
title: Raspberry Pi Torrentbox
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux, postinstall ]
---

# Raspberry Pi Torrentbox


## Setup

* Install [Arch Linux Arm](https://archlinuxarm.org/)
* Install [base-devel](https://www.archlinux.org/packages/?sort=&q=0adbase-devel)

I used the AUR manager [aurutils](https://aur.archlinux.org/packages/aurutils/))<sup>AUR</sup> to download and setup any AUR packages.

{%ace edit=true, lang='sh'%}
mkdir -p ~/Downloads  && cd ~/Downloads
gpg --recv-key 6BC26A17B9B7018A && gpg --lsign 6BC26A17B9B7018A
git clone https://aur.archlinux.org/aurutils.git
cd aurutils && makepkg -si && cd .. && rm -rf aurutils
{%endace%}

If used, setup repo for aurutils(https://docs.ramsdenj.com/operatingsystems/linux/distributions/archlinux/packagemanagement/aurutils.html).

## Install OpenVPN

ipv6 should be [disabled](https://wiki.archlinux.org/index.php/IPv6#Disable_IPv6) since PIA [doesn't support it](https://helpdesk.privateinternetaccess.com/hc/en-us/articles/232324908-Why-Do-You-Block-IPv6-). Add `ipv6.disable=1` to `/boot/cmdline.txt` and reboot. To check if it's disabled, see if you get an ipv6 address with `ip addr`. If disabled, `inet6` will not be present.

In order to install openvpn, required scripts need to be [downloaded and renamed](https://wiki.archlinux.org/index.php/Private_Internet_Access#Manual),

{%ace edit=true, lang='sh'%}
mkdir -p ~/Downloads/openvpn/certs  && cd ~/Downloads/openvpn/certs
curl http://www.privateinternetaccess.com/openvpn/openvpn-strong.zip --location --remote-name --remote-header-name
unzip openvpn-strong.zip
mv openvpn-strong.zip ~/Downloads/openvpn
{%endace%}

* `-L`, `--location`
    * Follow re-direct if the server reports that the requested page has moved to a different location
* `-O`, `--remote-name`
    * Write output to a local file named like the remote file we get.
* `-J`, `--remote-header-name`
    * This option tells the -O, --remote-name option to use the server-specified filename.

Replace all `.ovpn` extensions on the files downloaded with `.conf` and remove spaces in names.

To view the renames first, run.

{%ace edit=true, lang='sh'%}
for f in *.ovpn; do echo "${f} -->" "  "  "$(echo ${f} | sed -e 's/ //g' -e 's/.ovpn/.conf/')"; done
{%endace%}

If you're happy do the rename.

{%ace edit=true, lang='sh'%}
for f in *.ovpn; do mv "${f}" "$(echo ${f} | sed -e 's/ //g' -e 's/.ovpn/.conf/')"; done
{%endace%}