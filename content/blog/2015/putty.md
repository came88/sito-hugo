+++ 
draft = false
date = 2015-03-29
title = "Putty"
description = ""
slug = "" 
tags = ["putty", "programmi", "programmi windows"]
categories = []
externalLink = ""
series = []
+++

[Putty](https://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) è un client SSH completo per Windows.

## Problemi di visualizzazione

Per sistemare la visualizzazione di alcuni caratteri particolari (ad esempio usati da `aptitude`) può essere necessario modificare alcune impostazioni:

In Connection -> Data -> 'Terminal-type string' da `xterm` a `putty`

Dopo le modifiche è necessario salvare la sessione.

## Import / export configurazione

Per esportare tutta la sessioni salvate è possibile usare il comando
```cmd
regedit /e "%userprofile%\desktop\putty-sessions.reg" HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions
```
che creerà un file sul desktop dell'utente contenente le configurazioni esportate.

Per importare le sessioni è sufficiente importare nel registro quanto esportato.