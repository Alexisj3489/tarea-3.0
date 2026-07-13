#!/bin/sh
# Reemplazar la variable de entorno en el template para Nginx estático
envsubst '${NEXT_PUBLIC_API_URL}' < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js

# Arrancar Nginx en primer plano
exec "$@"