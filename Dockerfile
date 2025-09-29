# Stage 1: Install all dependencies with pnpm (using Node image)
FROM node:22 AS base
WORKDIR /usr/src/app
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Build the app
FROM base AS build
RUN mkdir -p /temp
COPY package.json pnpm-lock.yaml /temp/
WORKDIR /temp
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Install only production dependencies
FROM base AS prod-deps
RUN mkdir -p /temp
COPY package.json pnpm-lock.yaml /temp/
WORKDIR /temp
RUN pnpm install --frozen-lockfile --prod

# Stage 4: Serve with Bun
FROM oven/bun:1 AS release
WORKDIR /usr/src/app
COPY ./package.json .
COPY ./server.ts .
# Copy only production node_modules
COPY --from=prod-deps /temp/node_modules node_modules
# Copy built files and server entrypoint
COPY --from=build /temp/dist ./dist
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "server.ts"]
