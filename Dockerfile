# ==========================================
# Stage 1: Build de la Aplicación
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remover configuración y archivos por defecto
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copiar artefactos compilados desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración Nginx optimizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configuración de permisos para usuario sin privilegios
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
