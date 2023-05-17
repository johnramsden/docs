Setup container

{%ace lang='sh'%}
cd /var/lib/machines
debootstrap --include=systemd-container stretch matlab
{%endace%}

Login, set root password:

{%ace lang='sh'%}
systemd-nspawn -D matlab
passwd
{%endace%}

Start, setup network:

{%ace lang='sh'%}
systemd-nspawn --bind-ro=/dev/dri --bind=/tmp/.X11-unix -b -D matlab

systemctl enable --now systemd-networkd systemd-resolved
ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

useradd -m -s /bin/bash john
su john
export DISPLAY=:0
{%endace%}

Requirements:

apt-get install xorg build-essential libgtk2.0-0 libnss3 libasound2

Add sources to `/etc/apt/sources.list`:

{%ace lang='sh'%}
deb http://deb.debian.org/debian stretch main contrib non-free
deb-src http://deb.debian.org/debian stretch main contrib non-free

deb http://deb.debian.org/debian-security/ stretch/updates main contrib non-free
deb-src http://deb.debian.org/debian-security/ stretch/updates main contrib non-free

deb http://deb.debian.org/debian stretch-updates main contrib non-free
deb-src http://deb.debian.org/debian stretch-updates main contrib non-free
{%endace%}

Set on host `xhost +local:`

Get install files and run `./install` as root in container.

Install support.

{%ace lang='sh'%}
apt-get upgrade && apt-get install matlab-support
{%endace%}

Create 'shared'.
{%ace lang='sh'%}
mkdir ~/.share
{%endace%}

Edit service ovveride of `/usr/lib/systemd/system/systemd-nspawn@.service`

{%ace lang='sh'%}
[Service]
ExecStart=
ExecStart=/usr/bin/systemd-nspawn --quiet --keep-unit --boot \
                                  --link-journal=try-guest -U \
                                  --settings=override --machine=%i \
                                  --bind-ro=/dev/dri --bind=/tmp/.X11-unix \
                                  --bind=/home/john/.share:/home/john/share
{%endace%}

Might need to copy /etc/hostid to container.

Run matlab:

{%ace lang='sh'%}
xhost +local:; machinectl start matlab; machinectl shell john@matlab /bin/sh -c "DISPLAY=$DISPLAY /usr/local/bin/matlab"; xhost -;
{%endace%}
