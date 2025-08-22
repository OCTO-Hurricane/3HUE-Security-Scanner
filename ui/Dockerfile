# ---- Base Stage ----
# Using the official Bun image as our foundation
FROM oven/bun:1-alpine AS base
WORKDIR /app
 
# ---- Dependencies Stage ----
# This stage only runs when your package.json changes
FROM base AS deps
COPY package.json ./
# Running the install command directly and reliably. Bun creates a bun.lockb file here.
RUN bun install
 
# ---- Builder Stage ----
# This stage builds your production-ready app
FROM base AS builder
# Copy the installed dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of your application code
COPY . .
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1
# Run the build command with Bun
RUN bun run build
 
# ---- Development Stage ----
# This is the target your docker-compose-dev.yml file will use
FROM base AS dev
ENV NODE_ENV=development
# Copy the installed dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of your application code
COPY . .
EXPOSE 3000
# Starting the dev server with Bun
CMD ["bun", "run", "dev"]
 
# ---- Production Stage (for reference, not used in dev) ----
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs &&\
    adduser --system --uid 1001 nextjs
# Copy only the necessary built files from the 'builder' stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["bun", "start"]