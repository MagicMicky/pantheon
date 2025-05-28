# Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Add package files
COPY package.json package-lock.json* ./

# Install dependencies (with explicit --production=false to ensure dev dependencies are installed)
RUN npm ci --production=false

# Add application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create production image with nginx
FROM nginx:1.25-alpine AS production

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Setup nginx for better security
RUN sed -i '/user nginx/d' /etc/nginx/nginx.conf && \
    mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/scgi_temp \
             /var/cache/nginx/uwsgi_temp && \
    chmod -R 755 /var/cache/nginx

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 