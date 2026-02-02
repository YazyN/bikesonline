FROM node:24-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn global add turbo
COPY . .
RUN turbo prune vendor-panel --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build arguments - automatically populated from .env via docker-compose
ARG VITE_MEDUSA_BASE
ARG VITE_MEDUSA_BACKEND_URL
ARG VITE_MEDUSA_STOREFRONT_URL
ARG VITE_PUBLISHABLE_API_KEY
ARG VITE_TALK_JS_APP_ID
ARG VITE_DISABLE_SELLERS_REGISTRATION
ARG VITE_MEDUSA_PROJECT

# Install dependencies
COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile --network-timeout 100000

# Build the application
COPY --from=builder /app/out/full/ .
WORKDIR /app/apps/vendor-panel
RUN yarn build:preview

# RUNTIME STAGE
FROM node:24-alpine AS runtime

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=installer /app/apps/vendor-panel/dist /app

WORKDIR /app

EXPOSE 7000

# Serve static files
CMD ["serve", "-s", ".", "-l", "7000"]
