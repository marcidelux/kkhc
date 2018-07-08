#!/bin/bash

until nc -z test_db 27018
do
    sleep 1
done

npm run jest