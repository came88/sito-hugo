+++
draft = false
date = 2015-03-29T14:20:56+02:00
title = "mRemoteNG"
description = "Integrazioni utili per mRemoteNG"
slug = "" 
tags = ["mRemoteNG", "programmi", "programmi windows"]
categories = []
externalLink = ""
series = []
+++

[mRemoteNG](http://www.mremoteng.org/) è un programma per Windows per la gestione remota multiprotocollo.
Supporta (tra gli altri) RDP (il desktop remoto di windows) e SSH.

## Applicazioni esterne

mRemoteNG supporta l'integrazione di applicazioni esterne. 
Di seguito c'è un file di configurazione di esempio con alcuni programmi come chrome, firefox, filezilla.

Il file va posizionato al path `%APPDATA%/mRemoteNG/extApps.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<Apps>
    <App DisplayName="Filezilla SFTP" FileName="C:\Program Files\FileZilla FTP Client\filezilla.exe" Arguments="sftp://%Username%:%Password%@%Hostname%:%port%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="Filezilla FTP" FileName="C:\Program Files\FileZilla FTP Client\filezilla.exe" Arguments="ftp://%Username%:%Password%@%Hostname%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="Chrome" FileName="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" Arguments="%Hostname%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="Firefox" FileName="C:\Program Files (x86)\Mozilla Firefox\firefox.exe" Arguments="%Hostname%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="Ping" FileName="cmd" Arguments="/k ping -t %HostName%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="Traceroute" FileName="cmd" Arguments="/k set /P = | tracert %HostName%" WaitForExit="False" TryToIntegrate="False" />
    <App DisplayName="View Details" FileName="cmd" Arguments="/c echo Host     : %hostname% &amp; echo Port     : %port% &amp; echo Domain   : %domain% &amp; echo User     : %username% &amp; echo Password : %password% &amp; echo. &amp; pause" WaitForExit="False" TryToIntegrate="False" />
</Apps>
```