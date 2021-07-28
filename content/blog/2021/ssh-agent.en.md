+++ 
draft = false
date = 2021-07-28T22:36:07+02:00
title = "Ssh-agent in WSL"
description = "Configure ssh-agent in WSL"
slug = "ssh-agent-wsl"
tags = ["SSH", "ssh-agent", "WSL", "windows", "linux"]
categories = []
externalLink = ""
series = []
+++

[Windows Subsystem for Linux](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux)
make it possible to run linux programs on a windows system almost natively, but one thing I was missing
was an `ssh-agent` setup that just worked.

The problems to solve are two:
- run `ssh-agent` when starting the chosen WSL distribution (in my case Ubuntu)
- close `ssh-agent` when finished using WSL

The first problem is solved as easily as on any linux system, for example by adding this code in your `.bash_profile` (the following code was originally fond in http://mah.everybody.org/docs/ssh)

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

This setup works, but unfortunately the active `ssh-agent` daemon prevents WSL from shutting down
when it is no longer needed (in some cases keeping few gigs of RAM ...)

Of course, shutting down `ssh-agent` means *forgetting* the passwords of the previously used ssh keys, but this can
be acceptable if you have finished using WSL.

To solve this problem it is necessary to periodically check that WSL is still in use: this can be done
with a script that checks if there are any `bash` processes running, and if they haven't been in a while then kill `ssh-agent`.

The script is the following, saved in `$HOME/check_ssh-agent.sh`:

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

and it is referenced in the previous script inside the `start_agent` function, as follows:

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

After closing all terminals and waiting for 5 minutes, `ssh-agent` will be killed and the WSL session will be terminated.
