FROM node:24-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn global add turbo
COPY . .
RUN turbo prune admin-panel --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build arguments - automatically populated from .env via docker-compose
ARG VITE_MEDUSA_BASE
ARG VITE_MEDUSA_BACKEND_URL
ARG VITE_MEDUSA_STOREFRONT_URL
ARG VITE_MEDUSA_B2B_PANEL

# Install dependencies
COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile --network-timeout 100000

# Build the application
COPY --from=builder /app/out/full/ .
WORKDIR /app/apps/admin-panel
RUN yarn build:preview

# RUNTIME STAGE
FROM node:24-alpine AS runtime

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=installer /app/apps/admin-panel/dist /app

WORKDIR /app

EXPOSE 8000

# Serve static files
CMD ["serve", "-s", ".", "-l", "8000"]
