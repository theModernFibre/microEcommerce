#!/bin/sh
set -e
export PORT="${PORT:-80}"
export API_GATEWAY_HOSTPORT="${API_GATEWAY_HOSTPORT:-api-gateway:8080}"
envsubst '${PORT} ${API_GATEWAY_HOSTPORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
