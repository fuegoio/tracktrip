FROM oven/bun:1-debian AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM debian:bookworm-slim AS release

WORKDIR /app

COPY ./migrations ./migrations
COPY --from=build /app/dist ./dist

EXPOSE 3000/tcp
ENV NODE_ENV=production

ENTRYPOINT ["./dist/server"]
