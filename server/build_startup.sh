#!/bin/bash

until nc -z db 27017
do
    echo "waiting for Database ..."
    sleep 1
done

cd server

echo "Seeding database with folder structure..."
node database/dbSeed.js

echo "Starting Server..."
node app.js
