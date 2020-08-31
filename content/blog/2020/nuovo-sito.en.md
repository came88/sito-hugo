+++ 
draft = false
date = 2020-08-25T13:43:02+02:00
title = "New site"
description = "New site with Hugo"
slug = "new-site" 
tags = ["site", "hugo", "nginx", "Docker", "SSH", "rsync"]
categories = []
externalLink = ""
series = []
+++

I finally managed to give a little more structure to this site.

I left WordPress (too much for what I really need) and tried [Hugo](https://gohugo.io/), a static site generator written in [GO](https://golang.org/) and based on [Markdown](https://it.wikipedia.org/wiki/Markdown).

This involved a number of things:

- Being the site static it is inherently more secure for the host (me).

- I have transformed my old personal wiki (`wiki.cameroni.eu`) into articles from this blog, so that I can also dismiss [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki).
The syntax of MediaWiki is similar to Markdown and there were few articles, so the work wasn't huge.

- Without WordPress and MediaWiki I no longer need PHP and Mysql, and I don't have to spend time configuring and keeping them updated.

- The reduction of necessary resources allows me to host this site directly *in my home*, on my NAS, using [nginx](https://nginx.org/) in [Docker](https://www.docker.com/).

Hugo's guide includes a [handy script](https://gohugo.io/hosting-and-deployment/deployment-with-rsync/#shell-script) to perform automatic site deployment via SSH and rsync:

```sh
#!/bin/sh
USER=my-user
HOST=my-server.com             
DIR=my/directory/to/topologix.fr/   # the directory where your web site files should go

hugo && rsync -avz --delete public/ ${USER}@${HOST}:~/${DIR}

exit 0
```

Using this script and a Docker configuration (using `docker-compose`) like the following...

```yaml
version: '3'

services:
 web:
    image: nginx:alpine
    restart: always
    volumes:
      - /home/lorenzo/sito:/usr/share/nginx/html:ro
      - ./default.conf:/etc/nginx/conf.d/default.conf:ro
```

... with the `default.conf` file similar to the following...

```nginx
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

... *et voilà*, the site is online 😃 (or almost, SSL and other little things are missing, but the hard part is over).