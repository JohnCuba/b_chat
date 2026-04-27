# --- WASM build stage ---
FROM rust:1-bookworm AS wasm-build

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl -fsSL https://rustwasm.github.io/wasm-pack/installer/init.sh | sh

WORKDIR /app/packages/crypto

COPY packages/crypto/Cargo.toml packages/crypto/package.json ./
COPY packages/crypto/src ./src

RUN wasm-pack build --target bundler --release

# --- JS/TS build stage ---
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json apps/backend/
COPY packages/web-ui/package.json packages/web-ui/
COPY packages/protocol/package.json packages/protocol/
COPY packages/crypto/package.json packages/crypto/

RUN bun install --frozen-lockfile

COPY . .
COPY --from=wasm-build /app/packages/crypto/pkg ./packages/crypto/pkg

RUN bun run --filter '@b_chat/web-ui' build \
 && bun run --filter '@b_chat/backend' build

# --- Runtime stage ---
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=build /app/apps/backend/b_chat ./b_chat
COPY --from=build /app/apps/backend/public ./public

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["./b_chat"]
