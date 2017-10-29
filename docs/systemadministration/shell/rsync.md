---
title: rsync
---

# rsync

## Progress

To get better progress statistics, force rsync to calculate files before transfer using ```--no-i-r``` and ```--info=progress2```

For example:

```
rsync -r --info=progress2 src dest
```

## NTFS problems

I've had issues with transfers to NTFS drives crashing. Not transferring permissions and groups as well as using specific ownership after transfer seems to resolve the issue.

```
rsync -r --no-p --no-g --chmod=ugo=rwX src dest
```
