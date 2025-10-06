# packages/frontend/Dockerfile

# --- STAGE 1: Build Stage ---
FROM oven/bun:1.0 AS install

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy root package.json and workspace configuration
COPY package.json ./
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies for the frontend package
WORKDIR /app/packages/frontend
RUN npm ci --only=production

# Copy frontend source code
COPY packages/frontend/ ./

# Build the application
RUN npm run build

# --- STAGE 2: Production Stage ---
# Using lightweight Nginx image
FROM nginx:stable-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]