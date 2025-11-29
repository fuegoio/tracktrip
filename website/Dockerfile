FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1 AS release
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY ./package.json .

COPY --from=build /app/dist ./dist

EXPOSE 4321/tcp
ENTRYPOINT ["bun", "run", "start"]
