# ============================================
# STAGE 1: BUILD - Compilar la aplicación
# ============================================
FROM node:22-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
# Si existe package-lock.json, usar npm ci para instalación determinística
# Si no existe, usar npm install
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación (genera el directorio dist)
RUN npm run build

# ============================================
# STAGE 2: RUNTIME - Servir con Nginx
# ============================================
FROM nginx:alpine

# Copiar los archivos estáticos compilados desde el stage de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx (puerto 8561)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el script de entrypoint que inyecta variables y levanta Nginx
# COPY docker-entrypoint.sh /docker-entrypoint.sh
# RUN chmod +x /docker-entrypoint.sh

# Exponer el puerto 80 para el servidor web
EXPOSE 80

# Usar nginx directamente para simplificar
CMD ["nginx", "-g", "daemon off;"]
