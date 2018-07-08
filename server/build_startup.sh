#!/bin/bash

until nc -z db 27017
do
    sleep 1
done

cd server

node ./database/dbSeed.js

node app.js
