# packages/backend/Dockerfile (Lengkap & Sudah Diperbaiki)

# Stage 1: Install dependencies
FROM oven/bun:1.0 AS install
WORKDIR /app

# Path sekarang relatif dari root context
COPY package.json ./
COPY bun.lockb ./
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies using workspaces
RUN bun install --frozen-lockfile

# Stage 2: Build and run the app
FROM oven/bun:1.0
WORKDIR /app

# Copy dependencies from the install stage
COPY --from=install /app/node_modules ./node_modules
# Copy HANYA source code backend
COPY packages/backend/ .

# Generate Prisma client
RUN bunx prisma generate

# Expose the port
EXPOSE 3000

# Run the application
CMD ["bun", "src/main.ts"]