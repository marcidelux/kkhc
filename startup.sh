#!/bin/bash

until nc -z db 27017
do
    sleep 1
done
nodemon -L ./server/app.js
