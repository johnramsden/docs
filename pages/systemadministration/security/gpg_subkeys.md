---
title: Using GPG Subkeys
sidebar: systemadministration_sidebar
hide_sidebar: false
keywords: systemadministration, gpg
permalink: systemadministration_security_gpg_subkeys.html
toc: true
folder: systemadministration
---

List keys to get your key:

{% highlight shell %}
gpg --list-keys
{% endhighlight shell %}

Edit key:

{% highlight shell %}
gpg --edit-key <KEY ID>
{% endhighlight shell %}

At prompt, add a new subkey, select signing or encrypting, keysize, and expiry:

{% highlight shell %}
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
Your selection? 4
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (2048) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 2y
Key expires at Wed 04 Sep 2019 10:51:34 PM PDT
Is this correct? (y/N) y
Really create? (y/N) y
{% endhighlight shell %}

Repeat for encrypting key if you need one.

## Exporting the Subkey(s)

Get your new subkey's ID you want to export.

{% highlight shell %}
gpg --list-keys --with-subkey-fingerprint <KEY ID>
{% endhighlight shell %}

Export the subkey, keeping the ```!```, can list multiple keys:

{% highlight shell %}
gpg -a --export-secret-subkeys <subkey id>! [ <subkey id2>!] > temp_directory/subkey.gpg
{% endhighlight shell %}

To change the passphrase, import the key into a temporary folder.

{% highlight shell %}
mkdir temp_directory/gpg
gpg --homedir temp_directory/gpg --import temp_directory/subkey.gpg
{% endhighlight shell %}

Edit the key, and change the passphrase.

{% highlight shell %}
gpg --homedir temp_directory/gpg --edit-key <user-id>
{% endhighlight shell %}

{% highlight shell %}
> passwd
> save
{% endhighlight shell %}

Note: You will get a warning "error changing passphrase", but it can be ignored.

Now export again as the new, altered subkey.

{% highlight shell %}
gpg --homedir temp_directory/gpg -a --export-secret-subkeys [subkey id]! > temp_directory/subkey.altpass.gpg
{% endhighlight shell %}

References:
[Arch Wiki - GnuPG](https://wiki.archlinux.org/index.php/GnuPG#Edit_your_key)
[Debiamm- Subkeys](https://wiki.debian.org/Subkeys)
[void.gr](https://www.void.gr/kargig/blog/2013/12/02/creating-a-new-gpg-key-with-subkeys/)
