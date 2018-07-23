#!/bin/bash

until nc -z db 27017
do
    echo "waiting for Database ..."
    sleep 1
done

cd server

echo "Starting Server..."
node app.js
