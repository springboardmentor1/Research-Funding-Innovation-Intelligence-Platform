# ==============================================================================
# Research Funding & Innovation Intelligence Platform - Frontend Dockerfile
# Stage 1: Build React application using Node.js
# Stage 2: Serve static build artifacts using Nginx
# ==============================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
