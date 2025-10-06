# --- STAGE 1: Build Stage ---
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

RUN bun install --frozen-lockfile

COPY packages/frontend/ ./packages/frontend/

WORKDIR /app/packages/frontend
RUN bun run build

# --- STAGE 2: Production Stage ---
FROM nginx:stable-alpine

RUN apk add --no-cache curl

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
