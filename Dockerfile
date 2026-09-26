# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first so the layer is cached across code changes.
COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies from node_modules before shipping the image.
RUN npm prune --omit=dev


# ---- Runtime stage ---------------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Run as the unprivileged user that the base image already provides.
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/package.json ./package.json

USER node

EXPOSE 3000

# Config comes from the environment at runtime (docker-compose or your host).
CMD ["node", "dist/main.js"]
