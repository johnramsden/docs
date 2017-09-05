---
title: Re-authenticate IRC Nickname
sidebar: desktop_sidebar
hide_sidebar: false
keywords: irc, nick, nickname, authenticate
tags: [ network ]
permalink: desktop_internet_irc_authenticate_nick.html
toc: true
folder: desktop/internet
---

If the password isn't entered in the allowed time in IRC, a user can be blocked from signing in, and have their name temporarily changed to guest.

> You have 30 seconds to identify to your nickname before it is changed.
>
> You failed to identify in time for the nickname ```<nickname>```
> You are now known as Guest59588

If that occurs, doing the following can allow attempting to sign in again.

Identify your nick (replacing nick and password of course).

{% highlight shell %}
/quote NickServ identify $nick $password
{% endhighlight shell %}

Turn off enforce.

{% highlight shell %}
/quote NickServ set enforce OFF
{% endhighlight shell %}

Release your nick from services:

{% highlight shell %}
/quote NickServ release $nick $password
{% endhighlight shell %}

Login again.

{% highlight shell %}
/nick $nick
{% endhighlight shell %}

Turn enforce back on

{% highlight shell %}
/quote NickServ set enforce on
{% endhighlight shell %}
