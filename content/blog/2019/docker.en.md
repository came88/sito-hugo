+++ 
draft = false
date = 2019-05-14
title = "Update docker images"
description = "Update all docker images with one liner"
slug = "" 
tags = ["docker", "bash", "powershell"]
categories = ["docker"]
externalLink = ""
series = []
+++

Sometimes it can be usefull to upgrade all images you have downloaded with one command.

This can be achieved using a bash shell...

```bash
docker images --format "{{.Repository}}:{{.Tag}}" | xargs -L1 docker pull
```

... or a powershell:

```powershell
@(docker images --format "{{.Repository}}:{{.Tag}}") | %{& docker pull $_}
```