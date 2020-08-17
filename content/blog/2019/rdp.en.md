+++ 
draft = false
date = 2019-05-27T14:51:24+02:00
title = "An RDP (remote desktop protocol) useful tip"
description = ""
slug = "rdp" 
tags = ["rdp", "remote desktop", "windows"]
categories = ["rdp"]
externalLink = ""
series = []
+++

To send `CTRL-ALT-DELETE` to the remote machine it's possible to use the key combination `CTRL-ALT-END`.

When is not possible, e.g. when you are nesting rdp in rdp, it's possible to launch the following command `C:\Windows\explorer.exe shell:::{2559a1f2-21d7-11d4-bdaf-00c04f60b9f0}`.