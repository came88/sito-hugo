+++ 
draft = true
date = 2023-02-11T16:25:58+01:00
title = "Maven tips & tricks"
description = "Maven tips & tricks"
slug = "maven" 
tags = ["maven", "java"]
categories = ["maven"]
externalLink = ""
series = []
+++

Quando si deve configurare maven per lavorare in un ambiente enterprise ci sono alcune configurazioni da fare:

- impostare un `settings.xml` opportuno, con profili, repository, variabili, ...
- aggiungere tra i certificati fidati quelli usati dai repository interni all'azienda, se il certificato https non è trustato da java

Il primo è standard il secondo è più complesso...

Una soluzione ovvia potrebbe essere aggiungere il certificato al trust store della jvm usata, ma questo sarebbe da fare per ogni jvm installata (o usata) 
sul sistema e la configurazione varrebbe per tutte le esecuzioni di ogni applicativo in java (non solo per maven), con possibili problemi di sicurezza


Una soluzione migliore è aggiungere alla linea di comando di maven le opzioni di java necessarie a puntare a un keystore a cui è stato aggiunto il certificato
necessario, qualcosa tipo
```
-Djavax.net.ssl.trustStore=path/to/cacerts -Djavax.net.ssl.trustStorePassword=changeit
```

Queste opzioni possono non essere specificate manualmente ogni volta ma:

- possono essere aggiunte nella variabile d'ambiente `MAVEN_OPTS`, impostata nel sistema con i soliti modi (`.bash_profile` su linux, variabili d'ambiente su Windows)

- la variabile `MAVEN_OPTS` può essere dichiarata [nel file `$HOME/.mavenrc` (su windows `%USERPROFILE%\mavenrc_pre.cmd`)](https://maven.apache.org/ref/3-LATEST/apache-maven/)
  con un contenuto simile al seguente:
  ```bash
  export "MAVEN_OPTS=-Djavax.net.ssl.trustStore=path/to/cacerts -Djavax.net.ssl.trustStorePassword=changeit"
  ```
  o per windows
  ```bat
  set MAVEN_OPTS=-Djavax.net.ssl.trustStore=path/to/cacerts -Djavax.net.ssl.trustStorePassword=changeit
  ```
  ma con questa soluzione alcuni IDE ([come Intellij IDEA](https://youtrack.jetbrains.com/issue/IDEA-19759)) non prenderanno l'impostazione

- può essere specificata all'interno di un singolo progetto, [tramite i file nella cartella `.mvn` nella root di progetto](https://maven.apache.org/configure.html#mvn-directory),
  in particolare nel file `.mvn/jvm.config` che può essere simile al seguente
  ```
  -Djavax.net.ssl.trustStore=path/to/cacerts -Djavax.net.ssl.trustStorePassword=changeit
  ```

Nella documentazione ufficiale di maven c'è [una miniguida](https://maven.apache.org/guides/mini/guide-repository-ssl.html) nel caso in cui il repository richieda anche la mutua autenticazione SSL.
