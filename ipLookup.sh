#!/usr/bin/env bash

cd "$(dirname "$0")"

ip="$(ifconfig en0 | awk '$1 == "inet" {print $2}')"
echo $ip

sed -i "" "s/^const currentIp = '.*';$/const currentIp = '${ip}';/g" ./server/environmentConfig.js
