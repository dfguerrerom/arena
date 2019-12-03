#! /bin/sh
set -eu
envsubst < /etc/nginx/conf.d/backend.conf.envsubst > /etc/nginx/conf.d/backend.conf
envsubst < index.html.envsubst > index.html
exec nginx -g "daemon off;"
