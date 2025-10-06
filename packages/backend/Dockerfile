# packages/backend/Dockerfile (Fixed for Bun workspace)

# Stage 1: Install dependencies
FROM oven/bun:1.0 AS install
WORKDIR /app

# Copy workspace files
COPY package.json bun.lockb ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies using Bun workspace
RUN bun install --frozen-lockfile

# Stage 2: Build and run the app
FROM oven/bun:1.0
WORKDIR /app

# Copy dependencies from the install stage
COPY --from=install /app/node_modules ./node_modules

# Copy backend source code and prisma schema
COPY packages/backend/ .

# Generate Prisma client
RUN bunx prisma generate

# Expose the port
EXPOSE 3000

# Run the application
CMD ["bun", "src/main.ts"]