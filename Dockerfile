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

# Add non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create required directories and set permissions for nginx
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/scgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /tmp/nginx && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /tmp/nginx

# Comment out the user directive and use a PID file in a location the non-root user can access
RUN sed -i 's/^user/#user/' /etc/nginx/nginx.conf && \
    sed -i 's!pid /var/run/nginx.pid;!pid /tmp/nginx/nginx.pid;!' /etc/nginx/nginx.conf

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 