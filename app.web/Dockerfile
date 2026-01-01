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
COPY ./migrations ./migrations

COPY --from=build /app/dist ./dist

EXPOSE 3000/tcp
ENV NODE_ENV production

ENTRYPOINT ["bun", "run", "start"]
