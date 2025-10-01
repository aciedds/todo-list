FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy source & prisma
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# generate prisma client
RUN npx prisma generate

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
