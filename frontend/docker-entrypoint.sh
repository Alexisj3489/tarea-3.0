#!/bin/sh
set -eu

# Valor por defecto si no se define la variable de entorno al desplegar
: "${API_BASE_URL:=https://backalexis.byronrm.com}"
export API_BASE_URL

envsubst '${API_BASE_URL}' < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js

echo "config.js generado con API_BASE_URL=${API_BASE_URL}"
# No hacer 'exec' aqui: este script corre como hook dentro de
# /docker-entrypoint.d/, el entrypoint base de la imagen nginx es quien
# finalmente arranca el proceso nginx en primer plano.
