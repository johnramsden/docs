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

Install [openvpn](https://www.archlinux.org/packages/?name=openvpn).

{%ace edit=true, lang='sh'%}
pacman -S openvpn
{%endace%}

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

Move the files to `/etc/openvpn/client`, which is where OpenVPN expects them to be. Make sure they're owned by `root`.

{%ace edit=true, lang='sh'%}
install -D --owner=root --group=root ./* /etc/openvpn/client
{%endace%}

{%ace edit=true, lang='sh'%}
ls -la /etc/openvpn/client

total 188
drwxr-x--- 2 root network 4096 Feb 26 06:58 .
drwxr-xr-x 4 root root    4096 Feb 26 06:46 ..
-rwxr-xr-x 1 root root     297 Feb 26 06:58 AUMelbourne.conf
-rwxr-xr-x 1 root root     291 Feb 26 06:58 Austria.conf
-rwxr-xr-x 1 root root     287 Feb 26 06:58 AUSydney.conf
-rwxr-xr-x 1 root root     291 Feb 26 06:58 Belgium.conf
-rwxr-xr-x 1 root root     290 Feb 26 06:58 Brazil.conf
-rwxr-xr-x 1 root root     286 Feb 26 06:58 CAMontreal.conf
-rwxr-xr-x 1 root root    2719 Feb 26 06:58 ca.rsa.4096.crt
-rwxr-xr-x 1 root root     294 Feb 26 06:58 CAToronto.conf
-rwxr-xr-x 1 root root     296 Feb 26 06:58 CAVancouver.conf
-rwxr-xr-x 1 root root    1214 Feb 26 06:58 crl.rsa.4096.pem
-rwxr-xr-x 1 root root     289 Feb 26 06:58 ...
{%endace%}

## Configuration

The above configs can be used as is, or a custom one can be used. They contain the following. For `/etc/openvpn/client/Netherlands.conf`:

{%ace edit=true, lang='sh'%}
client
dev tun
proto udp
remote nl.privateinternetaccess.com 1197
resolv-retry infinite
nobind
persist-key
persist-tun
cipher aes-256-cbc
auth sha256
tls-client
remote-cert-tls server
auth-user-pass
comp-lzo
verb 1
reneg-sec 0
crl-verify crl.rsa.4096.pem
ca ca.rsa.4096.crt
disable-occ
{%endace%}

Copy the config to a new file.

{%ace edit=true, lang='sh'%}
[root]# cp /etc/openvpn/client/Netherlands.conf /etc/openvpn/client/custompivpn.conf
{%endace%}

Edit the file, replace the server `remote nl.privateinternetaccess.com 1197` with the PIA servers you want to use. The servers are in the openvpn files. They can all be listed with a `grep` for `privateinternetaccess.com`.

{%ace edit=true, lang='sh'%}
grep --no-filename privateinternetaccess.com /etc/openvpn/client/*

remote aus-melbourne.privateinternetaccess.com 1197
remote austria.privateinternetaccess.com 1197
remote aus.privateinternetaccess.com 1197
remote belgium.privateinternetaccess.com 1197
remote brazil.privateinternetaccess.com 1197
remote ca.privateinternetaccess.com 1197
remote ca-toronto.privateinternetaccess.com 1197
remote ca-vancouver.privateinternetaccess.com 1197
remote czech.privateinternetaccess.com 1197
remote denmark.privateinternetaccess.com 1197
remote fi.privateinternetaccess.com 1197
remote france.privateinternetaccess.com 1197
remote germany.privateinternetaccess.com 1197
remote hk.privateinternetaccess.com 1197
remote in.privateinternetaccess.com 1197
remote ireland.privateinternetaccess.com 1197
remote israel.privateinternetaccess.com 1197
remote italy.privateinternetaccess.com 1197
remote japan.privateinternetaccess.com 1197
remote mexico.privateinternetaccess.com 1197
remote nl.privateinternetaccess.com 1197
remote nz.privateinternetaccess.com 1197
remote no.privateinternetaccess.com 1197
remote ro.privateinternetaccess.com 1197
remote sg.privateinternetaccess.com 1197
remote spain.privateinternetaccess.com 1197
remote sweden.privateinternetaccess.com 1197
remote swiss.privateinternetaccess.com 1197
remote turkey.privateinternetaccess.com 1197
remote uk-london.privateinternetaccess.com 1197
remote uk-manchester.privateinternetaccess.com 1197
remote uk-southampton.privateinternetaccess.com 1197
remote us-atlanta.privateinternetaccess.com 1197
remote us-california.privateinternetaccess.com 1197
remote us-chicago.privateinternetaccess.com 1197
remote us-east.privateinternetaccess.com 1197
remote us-florida.privateinternetaccess.com 1197
remote us-midwest.privateinternetaccess.com 1197
remote us-newyorkcity.privateinternetaccess.com 1197
remote us-seattle.privateinternetaccess.com 1197
remote us-siliconvalley.privateinternetaccess.com 1197
remote us-texas.privateinternetaccess.com 1197
remote us-west.privateinternetaccess.com 1197
{%endace%}

To use a random server from a list, `remote-random` can be used. Replace the single server in `/etc/openvpn/client/custompivpn.conf` with the list of servers you would like to use. After the list add `remote-random`.

To auto-login to the vpn with your PIA user path, add your user and password to a file. Add the file path to the config after `auth-user-pass`, with the username on line one, and password on line two.

So as of now my config consists of the following:

{%ace edit=true, lang='sh'%}
client
dev tun
proto udp
remote nl.privateinternetaccess.com 1197
remote ca.privateinternetaccess.com 1197
remote ca-toronto.privateinternetaccess.com 1197
remote ca-vancouver.privateinternetaccess.com 1197
remote sweden.privateinternetaccess.com 1197
remote-random
resolv-retry infinite
nobind
persist-key
persist-tun
cipher aes-256-cbc
auth sha256
tls-client
remote-cert-tls server
auth-user-pass /etc/openvpn/pia_auth
comp-lzo
verb 1
reneg-sec 0
crl-verify crl.rsa.4096.pem
ca ca.rsa.4096.crt
disable-occ
{%endace%}