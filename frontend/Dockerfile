FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY index.html style.css script.js config.js.template /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/40-render-config.sh

RUN chmod +x /docker-entrypoint.d/40-render-config.sh

EXPOSE 80
