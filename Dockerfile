# --- Build stage ---
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json apps/backend/
COPY packages/web-ui/package.json packages/web-ui/
COPY packages/crypto/package.json packages/crypto/
COPY packages/protocol/package.json packages/protocol/

RUN bun install --frozen-lockfile

COPY . .

RUN bun run --filter '@b_chat/*' build

# --- Runtime stage ---
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=build /app/apps/backend/b_chat ./b_chat
COPY --from=build /app/apps/backend/public ./public

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["./b_chat"]
