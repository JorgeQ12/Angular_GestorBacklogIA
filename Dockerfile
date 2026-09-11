# ============================================================
#  Dockerfile multi-stage para el frontend Angular (GestorBacklogIA)
#  Etapa 1: build con Node + Angular CLI (ng build, config produccion)
#  Etapa 2: servir los estaticos con Nginx (SPA fallback a index.html)
# ============================================================

# --- Etapa 1: build -------------------------------------------------
FROM docker.io/library/node:22-alpine AS build
WORKDIR /app

# Instalar dependencias con la lockfile para builds reproducibles
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto del codigo y compilar en modo produccion
COPY . .
RUN npm run build -- --configuration=production

# --- Etapa 2: runtime (Nginx) --------------------------------------
FROM docker.io/library/nginx:1.27-alpine AS runtime

# Configuracion de Nginx para SPA (fallback a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estaticos compilados (Angular 21 -> subcarpeta browser)
COPY --from=build /app/dist/Angular_GestorBacklogIA/browser /usr/share/nginx/html

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
