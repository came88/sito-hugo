+++ 
draft = false
date = 2019-05-14
title = "Aggiornare le immagini docker"
description = "Aggiornare tutte le immagini docker con un solo comando"
slug = "" 
tags = ["docker", "bash", "powershell"]
categories = ["docker"]
externalLink = ""
series = []
+++

A volte può essere comodo aggiornare in con un unico comando tutte le immagini docker scaricate.

Questo può essere fatto da una shell bash...

```bash
docker images --format "{{.Repository}}:{{.Tag}}" | xargs -L1 docker pull
```

... o powershell:

```powershell
@(docker images --format "{{.Repository}}:{{.Tag}}") | %{& docker pull $_}
```