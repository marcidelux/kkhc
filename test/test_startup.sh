#!/bin/bash

until nc -z test_db 27017
do
    sleep 1
done

npm run jest
