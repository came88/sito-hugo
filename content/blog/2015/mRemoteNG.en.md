+++
draft = false
date = 2015-03-29
title = "mRemoteNG"
description = "mRemoteNG useful stuff"
slug = "" 
tags = ["mRemoteNG", "programs", "windows programs"]
categories = []
externalLink = ""
series = []
+++

[mRemoteNG](http://www.mremoteng.org/) is a multiprotocol remote management software.
It supports (aomng others) RDP (windows's remote desktop protocol) and SSH.

## External application

mRemoteNG supports the integration of external applications.
Below is a sample configuration file with some programs such as chrome, firefox, filezilla.

The file mist be in the path `%APPDATA%/mRemoteNG/extApps.xml`

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