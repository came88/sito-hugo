+++ 
draft = false
date = 2020-08-25T13:43:02+02:00
title = "Nuovo sito"
description = "Nuovo sito con Hugo"
slug = "nuovo-sito"
tags = ["sito", "hugo", "nginx", "Docker", "SSH", "rsync"]
categories = []
externalLink = ""
series = []
+++

Finalmente sono riuscito a dare un po' più di struttura a questo sito.

Ho lasciato WordPress (troppo per quel che mi serve realmente) e ho provato [Hugo](https://gohugo.io/), un generatore di siti statici scritto in [GO](https://golang.org/) e basato su [Markdown](https://it.wikipedia.org/wiki/Markdown).

Questo ha comportato una serie di cose:

- Essendo il sito statico è intrinsecamente più sicuro per chi lo ospita (io).

- Ho trasformato la mia vecchia wiki personale (`wiki.cameroni.eu`) in articoli di questo blog, in modo da poter dismettere anche [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki).
La sintassi di MediaWiki è simile a Markdown e gli articoli erano pochi, quindi il lavoro è stato abbastanza veloce.

- Senza WordPress e MediaWiki non ho più bisogno di PHP e Mysql, e non devo impiegare del tempo a configurarli e mantenerli aggiornati.

- La riduzione di risorse necessarie mi consente di ospitare questo sito direttamente *a casa mia*, sul mio NAS, utilizzando [nginx](https://nginx.org/) in [Docker](https://www.docker.com/).

La guida di Hugo comprende un [comodo script](https://gohugo.io/hosting-and-deployment/deployment-with-rsync/#shell-script) per eseguire il deploy automatico del sito tramite SSH e rsync:

```sh
#!/bin/sh
USER=my-user
HOST=my-server.com             
DIR=my/directory/to/topologix.fr/   # the directory where your web site files should go

hugo && rsync -avz --delete public/ ${USER}@${HOST}:~/${DIR}

exit 0
```

Questo e una configurazione di Docker (con docker-compose) tipo la seguente...

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

... con il file default.conf simile al seguente...

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

... *et voilà*, e il sito è online 😃 (o quasi, mancano SSL e altre cosette, ma il grosso è fatto).