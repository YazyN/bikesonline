FROM node:24-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN yarn global add turbo
COPY . .
RUN turbo prune b2c-storefront --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile --network-timeout 100000

# Build the project
COPY --from=builder /app/out/full/ .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN yarn turbo build --filter=b2c-storefront

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p apps/storefront/.next
RUN chown -R nextjs:nodejs apps/storefront

# Automatically leverage output traces to reduce image size
COPY --from=installer --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/storefront/public ./apps/storefront/public

USER nextjs

WORKDIR /app/apps/storefront

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]