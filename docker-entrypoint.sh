#!/bin/sh

# Script para inyectar variables de entorno en la aplicación React en tiempo de ejecución

# Crear el archivo env-config.js con las variables de entorno
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_UNLEASH_URL: "${VITE_UNLEASH_URL}",
  VITE_UNLEASH_CLIENT_KEY: "${VITE_UNLEASH_CLIENT_KEY}",
  VITE_UNLEASH_APP_NAME: "${VITE_UNLEASH_APP_NAME}"
};
EOF

# Ejecutar nginx
exec nginx -g 'daemon off;'
