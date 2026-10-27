# Stage 1: Build static React bundle with Vite
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies with caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Stage 2: Serve production assets with Nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing and API reverse-proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
