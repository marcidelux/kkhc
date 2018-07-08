#!/bin/bash

until nc -z db 27017
do
    echo "waiting for Database ..."
    sleep 1
done

echo "Seeding database with folder structure..."
node server/database/dbSeed.js

echo "Starting Server..."
node server/app.js
