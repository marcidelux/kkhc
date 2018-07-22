#!/bin/bash

until nc -z db 27019
do
    sleep 1
done

cd server

nodemon -L app.js
