---
title: Convert Text to Speech
sidebar: desktop_sidebar
hide_sidebar: false
keywords: text-to-speech, ffmpeg, espeak
tags: [ media, ffmpeg ]
permalink: media_text_to_speech.html
toc: true
folder: desktop/media
---

To convert a plain text file to an mp3, use the [espeak](http://espeak.sourceforge.net/) speech synthesizer and [ffmpeg](https://www.ffmpeg.org/) to save the audio as an mp3.

{% highlight shell %}
espeak -f Book.txt --stdout | ffmpeg -i - -ab 192k -y AudioBook.mp3
{% endhighlight shell %}

To convert a pdf to an mp3, use [pdftotext](http://www.foolabs.com/xpdf/home.html).

{% highlight shell %}
pdftotext Book.pdf - | espeak --stdout | ffmpeg -i - -ab 192k -y AudioBook.mp3
{% endhighlight shell %}