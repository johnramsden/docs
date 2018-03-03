---
title: Raspberry PI Secure VPN Torrentbox
category: [ archlinux, linux ]
keywords: archlinux, linux
tags: [ archlinux, linux ]
---

# Raspberry PI Secure VPN Torrentbox


## Setup

* Install [Arch Linux Arm](https://archlinuxarm.org/)
* Install [base-devel](https://www.archlinux.org/packages/?sort=&q=base-devel)

I used the AUR manager [aurutils](https://aur.archlinux.org/packages/aurutils/)<sup>AUR</sup> to download and setup any AUR packages.

{%ace edit=true, lang='sh'%}
mkdir -p ~/Downloads  && cd ~/Downloads
gpg --recv-key 6BC26A17B9B7018A && gpg --lsign 6BC26A17B9B7018A
git clone https://aur.archlinux.org/aurutils.git
cd aurutils && makepkg -si && cd .. && rm -rf aurutils
{%endace%}

If used, setup repo for [aurutils](https://docs.ramsdenj.com/operatingsystems/linux/distributions/archlinux/packagemanagement/aurutils.html).

### OpenVPN

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

#### Configuration

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

I created `/etc/openvpn/pia_auth`

{%ace edit=true, lang='sh'%}
touch /etc/openvpn/pia_auth
chown root:root /etc/openvpn/pia_auth && chmod 660 /etc/openvpn/pia_auth
{%endace%}

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

If you're connected over SSH to your pi, connection to the pi will drop if openvpn is started. This is because the default gateway changes. To make local connections continue to be routed over the same interface that SSH was started on, add a new table using the `ip` command. 

{%ace edit=true, lang='sh'%}
ip rule add table 128 from <PI IP ADDRESS>
ip route add table 128 to <SUBNET>/24 dev <INTERFACE>
ip route add table 128 default via <GATEWAY>
{%endace%}

For me this look like the following since the IP address of my pi was `172.20.30.4`, and my interface was `eth0`.

{%ace edit=true, lang='sh'%}
ip rule add table 128 from 172.20.30.4
ip route add table 128 to 172.20.30.0/24 dev eth0
ip route add table 128 default via 172.20.30.1
{%endace%}

I added these as an `ExecStartPre` to `systemd-networkd.

{%ace edit=true, lang='sh'%}
systemctl edit systemd-networkd
{%endace%}

{%ace edit=true, lang='sh'%}
[Service]
ExecStartPre=-/usr/bin/ip rule add table 128 from 172.20.30.4
ExecStartPre=-/usr/bin/ip route add table 128 to 172.20.30.0/24 dev eth0
ExecStartPre=-/usr/bin/ip route add table 128 default via 172.20.30.1
{%endace%}

Now open VPN can be started. A systemd unit exists that lets any client configurations be started from the directory where we put our configuration, so long as they end in `.conf`. If everything is setup correctly we should be able to start our VPN connection with `systemctl start openvpn-client@custompivpn`.

I was concerned about losing connection and not being able to get back into my pi, so the first time I started the service in `tmux` with a five minute kill timer so that if I wasn't able to reconnect I knew that after 5 minutes the service would be stopped and I would be able to get back in.

{%ace edit=true, lang='sh'%}
systemctl start openvpn-client@custompivpn; \
sleep 5m; \
systemctl stop openvpn-client@custompivpn
{%endace%}

Fortunately everything was setup correctly so my connection wasn't dropped.

To make sure that the VPN is working correctly, and that your IP is changing, check your IP address before and after the VPN is started with `curl -s checkip.dyndns.org`. After starting the VPN I got a swedish IP address meaning the VPN was working.

### Create User

I'll be using the `media` user and group for everything torrent related. Create it.

{%ace edit=true, lang='sh'%}
groupadd --gid 8675309 media
useradd --system --shell /usr/bin/nologin --gid 8675309 --uid 8675309 media
{%endace%}

### Network Shares

If mounting [NFS shares](https://wiki.archlinux.org/index.php/NFS#Installation) install the [nfs-utils](https://www.archlinux.org/packages/?name=nfs-utils) package.

#### NFS Configuration

{%ace edit=true, lang='sh'%}
pacman -S nfs-utils
{%endace%}

Enable NFSv4 idmapping

{%ace edit=true, lang='sh'%}
echo N > /sys/module/nfs/parameters/nfs4_disable_idmapping
{%endace%}

Set permanent in `/etc/modprobe.d/nfsd.conf`.

{%ace edit=true, lang='sh'%}
options nfsd nfs4_disable_idmapping=0
{%endace%}

[Optionally](https://wiki.archlinux.org/index.php/NFS#Client) start `nfs-client.target`.

### Mount Shares

Add mounts to `/etc/fstab`.

{%ace edit=true, lang='sh'%}
mkdir -p /media/Downloads/{Complete,Incomplete} /media/Torrents
chown -R media:media /media/*
mount lilan.ramsden.network:/mnt/tank/media/Downloads/Complete /media/Downloads/Complete
mount lilan.ramsden.network:/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete
mount lilan.ramsden.network:/mnt/tank/media/Torrents /media/Torrents
{%endace%}

Generate fstab entries and copy paste nfs mounts into fstab.

{%ace edit=true, lang='sh'%}
genfstab -U /
{%endace%}

### DNS

Using `systemd-resolvd`, DNS can by dynamically updated when OpenVPN starts using the [update-systemd-resolved](https://github.com/jonathanio/update-systemd-resolved) script. Install from github or install the [openvpn-update-systemd-resolved](https://aur.archlinux.org/packages/openvpn-update-systemd-resolved/)<sup>AUR</sup> package.

You can then add the following into your OpenVPN configuration file:

{%ace edit=true, lang='sh'%}
script-security 2
setenv PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
up /etc/openvpn/scripts/update-systemd-resolved
down /etc/openvpn/scripts/update-systemd-resolved
down-pre
{%endace%}

It will then follow `dhcp-option` commands set in OpenVPN.

We can use PIA's DNS servers this way:

{%ace edit=true, lang='sh'%}
dhcp-option DNS 209.222.18.222
dhcp-option DNS 209.222.18.218
{%endace%}

Now, after starting the OpenVPN you should see the following new lines in `/etc/resolv.conf`.

{%ace edit=true, lang='sh'%}
nameserver 209.222.18.222
nameserver 209.222.18.218
{%endace%}

Start and anable OpenVPN.

{%ace edit=true, lang='sh'%}
systemctl enable --now openvpn-client@custompivpn
{%endace%}

My final config was the following.

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
script-security 2
setenv PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
up /etc/openvpn/scripts/update-systemd-resolved
down /etc/openvpn/scripts/update-systemd-resolved
down-pre
{%endace%}

### iptables killswitch

Enable ip forwarding, add the `net.ipv4.ip_forward=1` sysctl.

{%ace edit=true, lang='sh'%}
echo 'net.ipv4.ip_forward=1' | tee '/etc/sysctl.d/90-openvpn-networking.conf'
{%endace%}

Reload sysctls.

{%ace edit=true, lang='sh'%}
sysctl --system
{%endace%}

Create an [iptables](https://wiki.archlinux.org/index.php/Iptables) rules file in `/etc/iptables/iptables.rules`. 

Start with a filter table in the [iptables-restore](http://www.iptables.info/en/iptables-save-restore-rules.html) syntax.

{%ace edit=true, lang='sh'%}
*filter
{%endace%}

Drop all traffic by default.

{%ace edit=true, lang='sh'%}
--policy INPUT DROP
--policy FORWARD DROP
--policy OUTPUT DROP
{%endace%}

Start with input rules.

Only allow established connections and SSH from LAN, (use your LAN subnet).

{%ace edit=true, lang='sh'%}
--append INPUT --match conntrack --ctstate RELATED,ESTABLISHED --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --source 172.20.0.0/16 --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --source 127.0.0.0/8 --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --jump DROP
{%endace%}

Open ports deluge needs.

{%ace edit=true, lang='sh'%}
--append INPUT --protocol tcp --dport 56881:56889 --jump ACCEPT
--append INPUT --protocol udp --dport 56881:56889 --jump ACCEPT
{%endace%}

For remote access:

{%ace edit=true, lang='sh'%}
--append INPUT --protocol tcp --dport 58846 --jump ACCEPT
{%endace%}

Now output rules.

Allow the loopback interface and ping.

{%ace edit=true, lang='sh'%}
--append OUTPUT --out-interface lo --jump ACCEPT
--append OUTPUT --out-interface tun0 --protocol icmp --jump ACCEPT
{%endace%}

Allow LAN traffic (use your lan subnet).

{%ace edit=true, lang='sh'%}
--append OUTPUT --destination 172.20.30.0/24 --jump ACCEPT
{%endace%}

Allow PIA DNS servers.

{%ace edit=true, lang='sh'%}
--append OUTPUT --destination 209.222.18.222 --jump ACCEPT
--append OUTPUT --destination 209.222.18.218 --jump ACCEPT
{%endace%}

Optionally allow your own DNS server.

{%ace edit=true, lang='sh'%}
--append OUTPUT --destination 172.20.30.1 --jump ACCEPT
{%endace%}

Allow the VPN port and the interface.

{%ace edit=true, lang='sh'%}
--append OUTPUT --protocol udp --match udp --dport 1197 --jump ACCEPT
--append OUTPUT --out-interface tun0 --jump ACCEPT
{%endace%}

Finally commit the table.

{%ace edit=true, lang='sh'%}
COMMIT
{%endace%}

My final rules looks like the following:

{%ace edit=true, lang='sh'%}
# /etc/iptables/iptables.rules
# iptables rules for OpenVPN killswitch

*filter

--policy INPUT DROP
--policy FORWARD DROP
--policy OUTPUT DROP

--append INPUT --match conntrack --ctstate RELATED,ESTABLISHED --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --source 172.20.0.0/16 --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --source 127.0.0.0/8 --jump ACCEPT
--append INPUT --protocol tcp --dport 22 --jump DROP

--append INPUT --protocol tcp --dport 56881:56889 --jump ACCEPT
--append INPUT --protocol udp --dport 56881:56889 --jump ACCEPT

--append INPUT --protocol tcp --dport 58846 --jump ACCEPT

--append OUTPUT --out-interface lo --jump ACCEPT
--append OUTPUT --out-interface tun0 --protocol icmp --jump ACCEPT

--append OUTPUT --destination 172.20.30.0/24 --jump ACCEPT

--append OUTPUT --destination 209.222.18.222 --jump ACCEPT
--append OUTPUT --destination 209.222.18.218 --jump ACCEPT

--append OUTPUT --destination 172.20.30.1 --jump ACCEPT

--append OUTPUT --protocol udp --match udp --dport 1197 --jump ACCEPT
--append OUTPUT --out-interface tun0 --jump ACCEPT

COMMIT
{%endace%}

Save the file.

Test starting the VPN and firewall.

{%ace edit=true, lang='sh'%}
systemctl start iptables openvpn-client@custompivpn; \
sleep 5m; \
systemctl stop iptables openvpn-client@custompivpn
{%endace%}

Check they started successfully.

{%ace edit=true, lang='sh'%}
systemctl status iptables openvpn-client@custompivpn
{%endace%}

Try to ping google.

{%ace edit=true, lang='sh'%}
ping google.com
{%endace%}

Stop OpenVPN, and try again.

Your connection should be blocked.

{%ace edit=true, lang='sh'%}
ping google.com
PING google.com (216.58.216.174) 56(84) bytes of data.
ping: sendmsg: Operation not permitted
{%endace%}

Start and enable the iptables service.

{%ace edit=true, lang='sh'%}
systemctl enable --now iptables
{%endace%}

You may also want to set up a regular firewall to block unwanted incoming traffic. The arch Wiki has a good reference for a [simple stateful firewall](https://wiki.archlinux.org/index.php/Simple_stateful_firewall)

### Deluge

Now to setup the [deluge](https://wiki.archlinux.org/index.php/Deluge) service.

Install [deluge](https://www.archlinux.org/packages/?sort=&q=deluge)

Start and enable the system service, which runs as deluge.

{%ace edit=true, lang='sh'%}
systemctl enable --now deluged
{%endace%}

To connect remotely, [create a user](https://wiki.archlinux.org/index.php/Deluge#Create_a_user) in `~deluge/.config/deluge/auth` with `USER:PASSWORD:PERMISSIONS` (10 is admin). For example:

{%ace edit=true, lang='sh'%}
john:p422WoRd:10
{%endace%}

Stop deluge and set `"allow_remote": true` in `~deluge/.config/deluge/core.conf`. If `core.conf` doesn't exist, connect to the console.

{%ace edit=true, lang='sh'%}
sudo -u deluge deluge-console
{%endace%}

Now you should be able to connect to deluge from `<ip address>:<port>`, likely port 58846, while the VPN is off.

Settings:

* Network
  * Incoming Ports:
    * From: 56881
    * To: 56889
  * Outgoing Ports
    * Use random ports: yes
  * Network Extras
    * Peer Exchange: yes
    * DHT: yes
  * Encryption
    * Inbound: Forced
    * Outbound: Forced
    * Level: Full Stream
    * Encrypt entire stream: yes
* Proxy
  * Peer
    * Type: Socksv5 W/ Auth
    * Username: <PIA USERNAME>
    * Password: <PIA PASSWORD>
    * Host: <PIA HOST> I use proxy-nl.privateinternetaccess.com
    * Port: 1080

Add deluge user to media group:

{%ace edit=true, lang='sh'%}
gpasswd -a deluge media
{%endace%}

Using the proxy, check your ip is masked using an [IP checker torrent](http://btguard.com/BTGuard_Torrent_IP_Check.torrent). More info [here](https://wiki.btguard.com/index.php/CheckMyTorrentIP) (May need to restart deluge).


## References

* [How To Create A VPN Killswitch Using Iptables on Linux](https://linuxconfig.org/how-to-create-a-vpn-killswitch-using-iptables-on-linux)
* [iptables - save and restore](http://www.iptables.info/en/iptables-save-restore-rules.html)