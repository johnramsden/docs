---
title: Updating Nextcloud
sidebar: systemadministration_sidebar
hide_sidebar: false
keywords: nextcloud
tags: [  ]
permalink: systemadministration_updating_nextcloud.html
toc: false
folder: systemadministration
---

# Updating Nextcloud

https://docs.nextcloud.com/server/11/admin_manual/maintenance/manual_upgrade.html

## Stop Apache

```
service apache24 stop
```

## Maintenance Mode

```
su -m www -c 'php /usr/local/www/apache24/data/nextcloud/occ maintenance:mode --on'
```

### Backup

```
 mkdir -p /mnt/ncbup && cd /mnt/ncbup
```

Backup:

```
mysqldump --lock-tables -h localhost -u root -p nextcloud > nextcloud-sqlbkp_$(date +"%Y%m%d").bak
```

Move old directory

```
mv /usr/local/www/apache24/data/nextcloud /mnt/ncbup/nextcloud-old-`date +"%Y%m%d"`.bak
```

## Nextcloud

Download and check hash.

```
cd /mnt/ncbup
fetch https://download.nextcloud.com/server/releases/nextcloud-12.0.2.tar.bz2
fetch https://download.nextcloud.com/server/releases/nextcloud-12.0.2.tar.bz2.md5

md5 nextcloud-12.0.2.tar.bz2
cat nextcloud-12.0.2.tar.bz2.md5
```

If good, extract

```
tar -xjf nextcloud-12.0.2.tar.bz2
```

Move to server

```
mv nextcloud /usr/local/www/apache24/data/
chown -R www:www /usr/local/www/apache24/data/nextcloud
```

Copy the config.php file from your old Nextcloud directory to your new Nextcloud directory.

```
cp /mnt/ncbup/nextcloud-old-`date +"%Y%m%d"`.bak/config/config.php /usr/local/www/apache24/data/nextcloud/config/config.php
```

Grab old apps:

Check if already there

```
ls /mnt/ncbup/nextcloud-old-`date +"%Y%m%d"`.bak/apps/
ls /usr/local/www/apache24/data/nextcloud/apps/
```

Need to move:

```
bruteforcesettings
files_markdown
twofactor_totp
```

```
cd /mnt/ncbup/nextcloud-old-`date +"%Y%m%d"`.bak/apps
cp -r bruteforcesettings files_markdown twofactor_totp /usr/local/www/apache24/data/nextcloud/apps/
```

```
chown -R www:www /usr/local/www/apache24/data/nextcloud
find /usr/local/www/apache24/data/nextcloud/ -type d -exec chmod 750 {} \;
find /usr/local/www/apache24/data/nextcloud/ -type f -exec chmod 640 {} \;
  ```

## Upgrade

```
su -m www -c 'php /usr/local/www/apache24/data/nextcloud/occ upgrade'
```

Assuming your upgrade succeeded, disable the maintenance mode:

```
su -m www -c 'php /usr/local/www/apache24/data/nextcloud/occ maintenance:mode --off'
```

## Start Apache

```
service apache24 start
```

## Archive backup

Create a directory with all the upgrade files.

{% highlight shell %}
mkdir archive
mv nextcloud-12.0.2.tar.bz2 nextcloud-old-20170818.bak nextcloud-12.0.2.tar.bz2.md5 nextcloud-sqlbkp_20170818.bak 12.0.0-12.0.2-upgrade-`date +"%Y%m%d"`
tar -cvzf archive/12.0.0-12.0.2-upgrade-`date +"%Y%m%d"`.tar.gz nextcloud-12.0.2.tar.bz2 nextcloud-old-20170818.bak nextcloud-12.0.2.tar.bz2.md5 nextcloud-sqlbkp_20170818.bak
{% endhighlight shell %}

{% highlight shell %}
ls archive

12.0.0-12.0.2-upgrade-20170818.tar.gz
{% endhighlight shell %}

{% highlight shell %}
rm -rf  nextcloud-12.0.2.tar.bz2 nextcloud-old-20170818.bak nextcloud-12.0.2.tar.bz2.md5 nextcloud-sqlbkp_20170818.bak
{% endhighlight shell %}
