+++ 
draft = false
date = 2021-07-28T22:36:07+02:00
title = "Ssh-agent in WSL"
description = "Configurare ssh-agent in WSL"
slug = "ssh-agent-wsl"
tags = ["SSH", "ssh-agent", "WSL", "windows", "linux"]
categories = []
externalLink = ""
series = []
+++

[Windows Subsystem for Linux](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux)
consente di eseguire programmi per linux su un sistema windows in modo quasi nativo, ma una cosa
che mi mancava era una configurazione di `ssh-agent` che, semplicemente, funzionasse.

I problemi sono infatti due:
- lanciare `ssh-agent` all'avvio della distribuzione scelta di WSL (nel mio caso Ubuntu)
- chiudere `ssh-agent` al termine dell'utilizzo di WSL

Il primo problema è risolto facilmente come suun  qualunque sistema linux ad esempio aggiungendo questo codice nel proprio `.bash_profile`, (il codice che segue è preso da http://mah.everybody.org/docs/ssh)

```bash
SSH_ENV="$HOME/.ssh/environment"

function start_agent {
    echo "Initialising new SSH agent..."
    /usr/bin/ssh-agent | sed 's/^echo/#echo/' > "${SSH_ENV}"
    echo succeeded
    chmod 600 "${SSH_ENV}"
    . "${SSH_ENV}" > /dev/null
}

# Source SSH settings, if applicable

if [ -f "${SSH_ENV}" ]; then
    . "${SSH_ENV}" > /dev/null
    #ps ${SSH_AGENT_PID} doesn't work under cywgin
    ps -ef | grep ${SSH_AGENT_PID} | grep ssh-agent$ > /dev/null || {
        start_agent;
    }
else
    start_agent;
fi
```

Questo setup funziona, ma sfortunatamente il demone attivo di `ssh-agent` impedisce a WSL di spegnersi
quando non è più necessario (liberando anche qualche giga di RAM...)

Ovviamente spegnere `ssh-agent` significa *dimenticare* le password delle chiavi ssh usate in precedenza, ma questo può
essere accettablie se si è finito di utilizzare WSL.

Per risolvere questo problema è necessario controllere periodicamente che WSL sia ancora in uso: questo può essere fatto
con uno script che controlli se ci sono dei processi di `bash` in esecuzione, e se non ce ne sono da un po' di tempo killare `ssh-agent`.

Lo script è il seguente, salvato in `$HOME/check_ssh-agent.sh`:

```bash
#!/bin/bash
# kill ssh-agent when there aren't any other bash processes since about 5 minutes
LIMIT=30
COUNT=0
while sleep 10
do
    if [ $(pgrep -c ssh-agent) -eq 0 ] # ssh-agent closed: exit
    then
        exit 0
    fi
    if [ $(pgrep -c bash) -gt 1 ] # user is actove
    then
        COUNT=0
    else # user currently not active
        (( COUNT++ ))
        if [ $COUNT -gt $LIMIT ] # user not active for the required period of time
        then
            pkill ssh-agent
        fi
    fi
done
```

e richiamato modificando lo script precedente richiamando il nuovo script all'interno di `start_agent`, come segue:

```bash
SSH_ENV="$HOME/.ssh/environment"

function start_agent {
    echo "Initialising new SSH agent..."
    /usr/bin/ssh-agent | sed 's/^echo/#echo/' > "${SSH_ENV}"
    echo succeeded
    chmod 600 "${SSH_ENV}"
    . "${SSH_ENV}" > /dev/null
	nohup bash $HOME/check_ssh-agent.sh &> /dev/null &
}

# Source SSH settings, if applicable

if [ -f "${SSH_ENV}" ]; then
    . "${SSH_ENV}" > /dev/null
    #ps ${SSH_AGENT_PID} doesn't work under cywgin
    ps -ef | grep ${SSH_AGENT_PID} | grep ssh-agent$ > /dev/null || {
        start_agent;
    }
else
    start_agent;
fi
```

Chiudendo tutti i terminali, dopo 5 minuti `ssh-agent` verrà killato e la sessione di WSL potrà terminare.
