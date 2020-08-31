#!/bin/sh
USER=lorenzo
HOST=192.168.1.5
DIR=sito/

rm -rf public
hugo && rsync -avz --delete public/ ${USER}@${HOST}:~/${DIR}

exit 0
