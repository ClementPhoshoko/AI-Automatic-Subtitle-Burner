FROM node:22-alpine AS build

WORKDIR /app/client

COPY client/package.json client/package-lock.json* ./
RUN npm install

COPY client/ ./
RUN npm run build

# ── Production (Debian for full FFmpeg with libass) ──────────

FROM node:22-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg fonts-liberation && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

COPY server/ ./
COPY --from=build /app/client/dist ../client/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "app.js"]
