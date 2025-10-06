# Frontend Docker Setup

This document explains how to build and run the frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for multi-service setup)

## Building the Frontend Image

### Option 1: Using the build script (Recommended)

From the project root directory:

```bash
./build-frontend.sh
```

### Option 2: Using Docker directly

From the project root directory:

```bash
docker build -f packages/frontend/Dockerfile -t todo-list-frontend:latest .
```

### Option 3: Using Docker Compose

From the project root directory:

```bash
docker-compose up frontend
```

## Running the Container

### Standalone

```bash
docker run -p 8080:80 todo-list-frontend:latest
```

The application will be available at `http://localhost:8080`

### With Docker Compose (Full Stack)

```bash
docker-compose up
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3000)
- Frontend application (port 8080)

## Dockerfile Structure

The Dockerfile uses a multi-stage build:

### Stage 1: Build Stage
- Uses Node.js 18 Alpine
- Installs dependencies
- Builds the Vue.js application
- Outputs to `/app/packages/frontend/dist`

### Stage 2: Production Stage
- Uses Nginx Alpine
- Serves static files from `/usr/share/nginx/html`
- Includes custom Nginx configuration for SPA routing
- Includes health checks and security headers

## Nginx Configuration

The custom Nginx configuration includes:

- **SPA Routing**: Proper handling of Vue Router client-side routing
- **Static Asset Caching**: Optimized caching for JS, CSS, and image files
- **Security Headers**: XSS protection, content type options, etc.
- **Gzip Compression**: Reduces file sizes for better performance
- **API Proxy**: Routes `/api/*` requests to the backend service
- **Health Check Endpoint**: Available at `/health`

## Environment Variables

The frontend application uses the following environment variables:

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:3000`)

## Health Checks

The container includes health checks that verify:
- Nginx is running and responding
- The application is accessible

## Troubleshooting

### Build Issues

1. **Dependencies not found**: Ensure you're running from the project root
2. **Permission denied**: Make sure the build script is executable (`chmod +x build-frontend.sh`)
3. **Node modules issues**: Try clearing Docker cache: `docker builder prune`

### Runtime Issues

1. **404 errors on page refresh**: This is normal for SPAs - the Nginx config handles this
2. **API connection issues**: Check that the backend service is running and accessible
3. **Static assets not loading**: Verify the build output in the `dist` directory

### Debugging

To debug the container:

```bash
# Run container interactively
docker run -it --rm todo-list-frontend:latest sh

# Check Nginx logs
docker logs <container_id>

# Check Nginx configuration
docker exec <container_id> nginx -t
```

## Performance Optimization

The Dockerfile is optimized for production:

- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Minimal base image
- **Nginx caching**: Static assets are cached for 1 year
- **Gzip compression**: Reduces bandwidth usage
- **Security headers**: Protects against common attacks

## Development vs Production

### Development
- Use `npm run dev` for hot reloading
- No Docker needed for development

### Production
- Use Docker for consistent deployment
- Nginx serves optimized static files
- Includes all production optimizations
