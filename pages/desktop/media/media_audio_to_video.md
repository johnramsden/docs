---
title: Convert Text to Speech
sidebar: desktop_sidebar
hide_sidebar: false
keywords: audio-to-video, ffmpeg
tags: [ media, ffmpeg ]
permalink: media_audio_to_video.html
toc: true
folder: desktop/media
---

Using [find](/shell_find.html), loop over all mp3s and convert them to mp4 videos; applying an image which will form the video's backdrop.

{% highlight shell %}
find -name "*.mp3" -exec ffmpeg -loop 1 -i ${imagepath} -i {} -c:a aac -strict experimental -b:a 192k -shortest {}.mp4 \;
{% endhighlight shell %}
