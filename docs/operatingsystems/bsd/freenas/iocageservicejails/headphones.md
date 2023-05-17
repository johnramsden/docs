{%ace lang='sh'%}
iocage create --release 11.2-RELEASE --name headphones \
          boot=on vnet=on dhcp=on bpf=yes \
          allow_raw_sockets="1" \
          ip4_addr="vnet1|172.20.40.43/24" \
          interfaces="vnet1:bridge1" \
          defaultrouter="172.20.40.1" \
          resolver="search ramsden.network;nameserver 172.20.40.1;nameserver 8.8.8.8"
{%endace%}

iocage exec headphones 'mkdir -p /media/data/Music /var/db/headphones /media/Downloads/Complete /media/Downloads/Incomplete'
iocage exec headphones 'pw useradd -n media -u 8675309'

iocage fstab --add headphones '/mnt/tank/media/Music /media/data/Music nullfs rw 0 0'
iocage fstab --add headphones '/mnt/tank/data/database/headphones /var/db/headphones nullfs rw 0 0'
iocage fstab --add headphones '/mnt/tank/media/Downloads/Complete /media/Downloads/Complete nullfs rw 0 0'
iocage fstab --add headphones '/mnt/tank/media/Downloads/Incomplete /media/Downloads/Incomplete nullfs rw 0 0'

iocage exec headphones 'chown -R media:media /media /var/db/headphones'

### Lilan
q
zfs create tank/data/database/headphones

### Jail

pkg update && pkg upgrade && pkg install python27 sqlite3 py27-sqlite3 git

cd /var/db
git clone https://github.com/rembo10/headphones.git temp
mv temp/.git headphones/
rm -rf temp

chown -R media:media headphones/
su media
cd headphones/
git reset --hard HEAD

cp -r /var/db/headphones/init-scripts/init.freebsd /usr/local/etc/rc.d/headphones
ee /usr/local/etc/rc.d/headphones

sysrc headphones_enable=YES
sysrc headphones_user=media
sysrc headphones_dir=/var/db/headphones
sysrc headphones_conf=/var/db/headphones/config.ini

su media
ee headphones/config.ini

exit

ln -s /usr/local/bin/python2.7 /usr/local/bin/python
service headphones start
