+++ 
draft = false
date = 2015-04-01
Lastmod = 2020-04-20 #forse non usato???
title = "Tiny Tiny RSS"
description = ""
slug = "tt-rss" 
tags = ["tt-rss", "programmi", "programmi web", "linux", "php"]
categories = []
externalLink = ""
series = []
+++

[Tiny Tiny RSS](http://tt-rss.org/) è un lettore per feed RSS web based.

Questo articolo è stato modificato dopo la stesura iniziale:
 - 12/04/2015 (cancellazione automatica dei log vuoti)
 - 06/11/2016 (sezione di systemd)
 - 06/08/2019 (aggiunto aggiornamento automatico schema DB)
 - 20/04/2020 (aggiornamento script per modifica formato file di configurazione)

## Aggiornamento contenuti (usando init)
Il codice che segue è tratto da [questo repository](https://github.com/biapy/howto.biapy.com/tree/master/web-applications/tiny-tiny-rss) ed è stato leggermente modificato.

I file impattati sono 2:
* `/etc/default/tt-rss` contenente la configurazione
* `/etc/init.d/tt-rss` contenente lo script di avvio/stop vero e proprio, richiamabile con `service tt-rss start|stop|restart`

### File `/etc/default/tt-rss`
```bash
## Defaults for Tiny Tiny RSS update daemon init.d script

# Set DISABLED to 1 to prevent the daemon from starting.
DISABLED=0

# Emplacement of your Tiny Tiny RSS installation.
TTRSS_PATH="/var/www/tt-rss"

# Set FORKING to 1 to use the forking daemon (update_daemon2.php) in stead of
# the standard one.
# This option is only available for Tiny Tiny RSS 1.2.20 and over.
FORKING=1
```

### File `/etc/init.d/tt-rss`
```bash
#!/bin/bash
### BEGIN INIT INFO
# Provides:          tt-rss
# Required-Start:    $local_fs $remote_fs networking mysql
# Required-Stop:     $local_fs $remote_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Tiny Tiny RSS update daemon
# Description:       Update the Tiny Tiny RSS subscribed syndication feeds.
### END INIT INFO

# Author: Pierre-Yves Landuré <pierre-yves@landure.org>

# Do NOT "set -e"

# PATH should only include /usr/* if it runs after the mountnfs.sh script
PATH="/sbin:/usr/sbin:/bin:/usr/bin"
DESC="Tiny Tiny RSS update daemon"
NAME=$(command readlink -f "${0}")
NAME=$(command basename "$NAME")
DISABLED=0
FORKING=0

# Read configuration variable file if it is present
[ -r "/etc/default/${NAME}" ] && . "/etc/default/${NAME}"

DAEMON_SCRIPT="update.php --daemon"

if [ "${FORKING}" != "0" ]; then
	DAEMON_SCRIPT="update_daemon2.php"
fi

DAEMON="/usr/bin/php"
DAEMON_ARGS="${TTRSS_PATH}/${DAEMON_SCRIPT}"
DAEMON_DIR="${TTRSS_PATH}"
PIDFILE="/var/run/${NAME}.pid"
SCRIPTNAME="/etc/init.d/${NAME}"
USER="www-data"
GROUP="www-data"

# Exit if the package is not installed
[ -x "${DAEMON}" ] || exit 0

# Load the VERBOSE setting and other rcS variables
. /lib/init/vars.sh

# Define LSB log_* functions.
# Depend on lsb-base (>= 3.0-6) to ensure that this file is present.
. /lib/lsb/init-functions

if [ "${DISABLED}" != "0" -a "${1}" != "stop" ]; then
	command log_warning_msg "Not starting ${DESC} - edit /etc/default/${NAME} and change DISABLED to be 0.";
	exit 0;
fi

#
# Function that starts the daemon/service
#
do_start()
{
	# Return
	#   0 if daemon has been started
	#   1 if daemon was already running
	#   2 if daemon could not be started
	command start-stop-daemon --start --make-pidfile --chuid "${USER}" --group "${GROUP}" --background --quiet --chdir "${DAEMON_DIR}" --pidfile "${PIDFILE}" --exec "${DAEMON}" --test > /dev/null \
		|| return 1

	command start-stop-daemon --start --make-pidfile --chuid "${USER}" --group "${GROUP}" --background --quiet --chdir "${DAEMON_DIR}" --pidfile "${PIDFILE}" --exec "${DAEMON}" -- \
		${DAEMON_ARGS} \
		|| return 2
	# Add code here, if necessary, that waits for the process to be ready
	# to handle requests from services started subsequently which depend
	# on this one.  As a last resort, sleep for some time.
}

#
# Function that stops the daemon/service
#
do_stop()
{
	# Return
	#   0 if daemon has been stopped
	#   1 if daemon was already stopped
	#   2 if daemon could not be stopped
	#   other if a failure occurred
	command start-stop-daemon --stop --make-pidfile --user "${USER}" --group "${GROUP}" --quiet --retry=TERM/1/KILL/5 --pidfile "${PIDFILE}"
	RETVAL="$?"
	[ "${RETVAL}" = 2 ] && return 2
	# Wait for children to finish too if this is a daemon that forks
	# and if the daemon is only ever run from this initscript.
	# If the above conditions are not satisfied then add some other code
	# that waits for the process to drop all resources that could be
	# needed by services started subsequently.  A last resort is to
	# sleep for some time.
	command start-stop-daemon --stop --quiet --user "${USER}" --group "${GROUP}" --oknodo --retry=0/1/KILL/5 --pidfile "${PIDFILE}"
	[ "$?" = 2 ] && return 2
	# Many daemons don't delete their pidfiles when they exit.
	command rm -f "${PIDFILE}"
	return "${RETVAL}"
}


case "${1}" in
  start)
	[ "${VERBOSE}" != no ] && log_daemon_msg "Starting ${DESC}" "${NAME}"
	do_start
	case "$?" in
		0|1) [ "${VERBOSE}" != no ] && log_end_msg 0 ;;
		2) [ "${VERBOSE}" != no ] && log_end_msg 1 ;;
	esac
	;;
  stop)
	[ "${VERBOSE}" != no ] && log_daemon_msg "Stopping ${DESC}" "${NAME}"
	do_stop
	case "$?" in
		0|1) [ "${VERBOSE}" != no ] && log_end_msg 0 ;;
		2) [ "${VERBOSE}" != no ] && log_end_msg 1 ;;
	esac
	;;
  restart|force-reload)
	#
	# If the "reload" option is implemented then remove the
	# 'force-reload' alias
	#
	log_daemon_msg "Restarting ${DESC}" "${NAME}"
	do_stop
	case "$?" in
	  0|1)
		do_start
		case "$?" in
			0) log_end_msg 0 ;;
			1) log_end_msg 1 ;; # Old process is still running
			*) log_end_msg 1 ;; # Failed to start
		esac
		;;
	  *)
	  	# Failed to stop
		log_end_msg 1
		;;
	esac
	;;
  *)
	echo "Usage: ${SCRIPTNAME} {start|stop|restart|force-reload}" >&2
	exit 3
	;;
esac
```

Dopo aver caricato i 2 file è necessario dare il comando `update-rc.d tt-rss defaults`

A questo punto è possibile far partire, fermare o riavviare il demone di aggiornamento dei feed con il comando `service tt-rss start|stop|restart`

## Aggiornamento contenuti (usando systemd)
Rispetto alla versione precedente non è possibile configurare alcuni parametri e il file `/etc/default/tt-rss` non viene usato.

Il file necessario è il seguente:

### File `/etc/systemd/system/tt-rss.service`
```ini
[Unit]
Description=tt-rss update daemon
After=network.target mysql.service

[Service]
Type=simple
Environment=TTRSS_PATH=/var/www/tt-rss
ExecStart=/usr/bin/php ${TTRSS_PATH}/update_daemon2.php
User=www-data
Group=www-data

[Install]
WantedBy=default.target
```

Dopo aver installato questo file è necessario dare i comandi seguenti per ricaricare la configurazione di systemd, abilitare tt-rss e avviarlo:
```bash
systemctl daemon-reload
systemctl enable tt-rss.service
systemctl start tt-rss.service
```

## Aggiornamento di Tiny Tiny RSS
Quanto segue è un modo per aggiornare automaticamente l'installazione di Tiny Tiny RSS all'ultimo commit su GitHub.

Nel seguito si assume che l'utente usato da tt-rss e dal server web sia `www-data` e che il path di installazione di tt-rss sia `/var/www/tt-rss`.

**IMPORTANTE** lo script di aggiornamento deve avere i permessi per fermare e far ripartire il demone di aggiornamento, che altrimenti smetterebbe di funzionare dopo un aggiornamento. Questo viene fatto ad esempio configurando `sudo` come segue:

### File `/etc/sudoers.d/tt-rss`
**IMPORTANTE**: non caricare direttamente questo file, ma crearlo con `visudo /etc/sudoers.d/tt-rss`, altrimenti in caso di trasferimento interrotto o altri problemi sudo potrebbe cessare di funzionare.

```
www-data        ALL=NOPASSWD:/usr/sbin/service tt-rss *

www-data        ALL=NOPASSWD:/bin/systemctl start tt-rss.service
www-data        ALL=NOPASSWD:/bin/systemctl stop tt-rss.service
www-data        ALL=NOPASSWD:/bin/systemctl status tt-rss.service
www-data        ALL=NOPASSWD:/bin/systemctl is-active tt-rss.service
www-data        ALL=NOPASSWD:/bin/systemctl restart tt-rss.service
```

Questo significa che l'utente `www-data`, da qualunque terminale(`ALL`) e senza richiedere nessuna password (`NOPASSWD`) può eseguire il comando `/usr/sbin/service tt-rss *` piuttosto che eseguire i comandi `/bin/systemctl start|stop|status|is-active|restart tt-rss.service`.

NOTA: il primo set di comandi funziona sia usando lo script di avvio init che quello systemd, poiché systemd è retrocompatibile con i comandi init `service * start|stop|status|...`.

### Script di aggiornamento
In una cartella vuota (in questo esempio `/var/www/tt-rss_autoupdate` si esegua il comando `git clone https://github.com/gothfox/Tiny-Tiny-RSS.git git`, che creerà una sottocartella git con quanto presente su GitHub. Si crei anche una sottocartella `backups` che verrà usata per salvare i backup automatici durante gli aggiornamenti e i log stessi degli aggiornamenti.

Nella stessa cartella va messo anche il file sotto riportato `update.sh`, con le opportune modifiche di configurazione

Script di aggiornamento, da mettere in cron, ad esempio con <source lang="bash">sudo -u www-data crontab -e</source> aggiungendo una riga tipo

`0 5 * * * /var/www/tt-rss_autoupdate/update.sh  > /dev/null 2>&1`

(esecuzione quotidiana alle 5:00)

Di seguito è riportato un esempio per il file `/var/www/tt-rss_autoupdate/update.sh`

```bash
#!/bin/bash

### CONFIGURATIONS ###
# Mail configuration
MAIL_TO="MY_EMAIL"
MAIL_FROM="MAIL_FROM"

# Directory configuration
DIRGIT=/var/www/tt-rss_autoupdate/git
DIRTT=/var/www/tt-rss
DIRBK=/var/www/tt-rss_autoupdate/backups

# Database configurations
DB_TYPE="mysql"
DB_HOST="localhost"
DB_USER="ttrss"
DB_NAME="ttrss"
DB_PASS="MYPASSWORD"
DB_PORT="3306"

# Other configurations
SELF_URL_PATH="https://mysite.ext/"
REG_NOTIFY_ADDRESS="noreply@mysite.ext"
SMTP_FROM_ADDRESS="noreply@mysite.ext"
FEED_CRYPT_KEY="FEED_CRYPT_KEY"


### SCRIPT ###

DATE=$(date +%F)

{
	# check if the daemon is running
	if [ -f "$DIRTT/lock/update_daemon.lock" ] ; then
		STARTSTOPDAEMON="true"
	else
		STARTSTOPDAEMON="false"
	fi

	cd $DIRGIT
	git fetch origin
	reslog=$(git log HEAD..origin/master --oneline)
	if [[ "${reslog}" != "" ]] ; then
		# there are new changes: completing the pull
		git merge origin/master

		# shut down the update daemon if needed
		#$($STARTSTOPDAEMON) && /sbin/start-stop-daemon -K -p $DIRTT/lock/update_daemon.lock
		$($STARTSTOPDAEMON) && sudo service tt-rss stop

		cd $(dirname $DIRTT)
		# back up current install files...
		tar -czf $DIRBK/tt-rss-${DATE}.tar.gz $(basename $DIRTT)
		# ... and database...
		if [ "$DB_TYPE" == "mysql" ] ; then
			MYSQL_PWD="$DB_PASS"  mysqldump  -h $DB_HOST -P $DB_PORT -u $DB_USER $DB_NAME | gzip > $DIRBK/tt-rss-${DATE}.sql.gz
		else
			PGPASSWORD="$DB_PASS" pg_dump -w -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME | gzip > $DIRBK/tt-rss-${DATE}.sql.gz
		fi
		# ... and delete backups older than 2 weeks
		find $DIRBK -maxdepth 1 -type f -mtime +14 -exec rm -f {} \;

		# copy only modified files, except git related
		rsync -rvch --exclude=.git/ --exclude=.buildpath --exclude=.gitignore --exclude=.project $DIRGIT/ $DIRTT

		# update schema if needed
		echo yes | php -f $DIRTT/update.php -- --update-schema

		# always use new config file, maybe there are new parameters
		# change config file to personalized settings
		sed $DIRGIT/config.php-dist -f - <<-SED_SCRIPT > $DIRTT/config.php
			/DB_TYPE/					s/%DB_TYPE/$DB_TYPE/
			/DB_HOST/					s/%DB_HOST/$DB_HOST/
			/DB_USER/					s/%DB_USER/$DB_USER/
			/DB_NAME/					s/%DB_NAME/$DB_NAME/
			/DB_PASS/					s/%DB_PASS/$DB_PASS/
			/DB_PORT/					s/%DB_PORT/$DB_PORT/
			/SELF_URL_PATH/ 			s#%SELF_URL_PATH#$SELF_URL_PATH#
			/REG_NOTIFY_ADDRESS/		s/user@your.domain.dom/$REG_NOTIFY_ADDRESS/
			/SESSION_CHECK_ADDRESS/		s/1/0/
			/SMTP_FROM_ADDRESS/			s/reply@your.domain.dom/$SMTP_FROM_ADDRESS/
			/FEED_CRYPT_KEY/			s/''/'$FEED_CRYPT_KEY'/
		SED_SCRIPT

		# start the update daemon if needed
		#$($STARTSTOPDAEMON) && /sbin/start-stop-daemon -b -c www-data:www-data -S -x /usr/bin/php $DIRTT/update_daemon2.php -- --feeds --quiet
		$($STARTSTOPDAEMON) && sudo service tt-rss start
		
		/usr/sbin/sendmail -t <<-MAIL_BODY
		Subject: Installazione di tt-rss aggiornata
		From: $MAIL_FROM
		To: $MAIL_TO
		Content-Type: text/plain; charset="utf-8"
		
		Tiny Tiny RSS è stata aggiornato al repository git.
		Si prega di controllare che tutto funzioni a dovere.
		
		Questo è un messaggio automatico, si prega di non rispondere.
		
		MAIL_BODY
	fi
} > $DIRBK/update-$DATE.log 2> $DIRBK/update-$DATE.err
find $DIRBK -maxdepth 1 -type f -size 0 -exec rm -f {} \;
```
