#!/bin/bash

until nc -z db 27017
do
    echo "waiting for Database ..."
    sleep 1
done

echo "Starting Server..."

cd server

forever app.js
