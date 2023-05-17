---
title: Sanoid
sidebar: systemadministration_sidebar
hide_sidebar: false
category: [ zfs, systemadministration ]
keywords: zfs
permalink: systemadministration_zfs_mirrors.html
toc: true
folder: systemadministration/zfs
---

Install sanoid, mbuffer, pv, lzop.

{%ace lang='sh'%}
mv /etc/sanoid/sanoid.conf /etc/sanoid/sanoid.conf.example
{%endace%}

Create prune unit:

{%ace lang='sh'%}
cat << "EOF" | sudo tee /etc/systemd/system/sanoid-prune.service
[Unit]
Description=Cleanup ZFS Pool
Requires=zfs.target
After=zfs.target sanoid.service
ConditionFileNotEmpty=/etc/sanoid/sanoid.conf

[Service]
Environment=TZ=UTC
Type=oneshot
ExecStart=/usr/bin/sanoid --prune-snapshots --verbose

[Install]
WantedBy=sanoid.service
EOF
{%endace%}

{%ace lang='sh'%}
######################################
# This is a sample sanoid.conf file. #
# It should go in /etc/sanoid.       #
######################################

[vault/data]
    use_template = data
    recursive = yes
    process_children_only = yes

[vault/sys/enix/home]
    use_template = data
    recursive = yes
    process_children_only = yes

[vault/sys/enix/ROOT]
    use_template = system
    recursive = yes
    process_children_only = yes

[vault/sys/enix/usr/local]
    use_template = system
[vault/sys/enix/var/cache/pacman]
    use_template = system
    recursive = yes
[vault/sys/enix/var/lib]
    use_template = system
    recursive = yes
[vault/sys/enix/var/log]
    use_template = system

#############################
# templates below this line #
#############################

[template_data]
    # Every 5 minutes
    frequent_period = 5
    # Keep for 6 hours (frequent_period*72)=(5*72) minutes
    frequently = 72
    hourly = 36
    daily = 30
    monthly = 12
    yearly = 1
    autosnap = yes
    autoprune = yes

[template_system]
    frequently = 0
    hourly = 12
    daily = 12
    monthly = 6
    yearly = 0
    autosnap = yes
    autoprune = yes

[template_ignore]
    autoprune = no
    autosnap = no
    monitor = no
{%endace%}

Install sanoid freenas:

mkdir -p /mnt/tank/system/local/share /mnt/tank/system/local/bin
cd /mnt/tank/system/local/share
git clone https://github.com/jimsalterjrs/sanoid.git
cd /mnt/tank/system/local/bin
ln -s ../share/sanoid/syncoid .

zfs create -o canmount=noauto tank/replication/wooly
zfs create -o canmount=noauto tank/replication/enix

User delegation:

useradd --create-home -s /bin/sh replicator
su - replicator
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDENPIfXWxIHLso5sSUgHB8ezAukyc9V4bp5tTOKVDErEH8F0Pe3u5JMN4EsrP4YAT3LMIJJjBui7htRJkzV7npaA73Qr8DP4j9QbYWvdS4moUzRBPgo/qH//xoHqGw7iN65TrUSyndDRPIaDAKrVuzrDk4XB52CUiOlcLMYFzoucb1kCkmb/JcYnmWhbREl1iWTJzTUuZcsa6uv3c2lzT8XRMRPD6ij+1VewjKE0OB0R2//Sgmkd20YXsz15Ny/+v8nBL9yPRHgEQWHn9u8vAtd9NmAZzAh+5VquqwgPLtOhqFhXHCKjMKHuC552C4AegoJYEGgn2DuByx9IWq7PD/ root@lilan.ramsden.network' >> .ssh/authorized_keys

pull:

zfs allow replicator compression,diff,mount,mountpoint,primarycache,readonly,refreservation,release,send,userprop,rollback vault
/usr/local/bin/perl /mnt/tank/system/local/bin/syncoid \
    --recursive \
    --no-privilege-elevation \
    replicator@lilan.ramsden.network:vault \
    tank/replication/enix/vault

mkdir -p /mnt/tank/system/root

push:

zfs allow -s @replrole compression,create,destroy,diff,mount,mountpoint,primarycache,readonly,receive,refreservation,release,send,userprop,rollback tank/replication

zfs allow -u replicator compression,create,destroy,diff,mount,mountpoint,primarycache,readonly,receive,refreservation,release,send,userprop,rollback tank/replication

syncoid --recursive \
        vault root@lilan.ramsden.network:tank/replication/wooly/vault

{%ace lang='sh'%}
cat << "EOF" | sudo tee /etc/systemd/system/syncoid.timer
[Unit]
Description=Run Syncoid Every 15 Minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
EOF
{%endace%}

{%ace lang='sh'%}
cat << "EOF" | sudo tee /etc/systemd/system/syncoid.service
[Unit]
Description=Run Syncoid
Requires=zfs.target

[Service]
Environment=TZ=UTC
Type=oneshot
ExecStart=/usr/bin/syncoid --recursive --no-privilege-elevation vault replicator@lilan.ramsden.network:tank/replication/enix/vault
EOF
{%endace%}

ps -aux|grep receive| awk '{print $2}'|xargs -n1 echo

systemctl enable --now sanoid.timer syncoid.timer
