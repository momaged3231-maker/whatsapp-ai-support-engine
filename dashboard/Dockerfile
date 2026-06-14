# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- run (standalone) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Prompts are read at runtime by the engine:
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Prompt files are mounted at /app/prompts by docker-compose (single source of
# truth in ./prompts). lib/prompts.js also has embedded fallbacks if the mount
# is absent.
EXPOSE 3000
CMD ["node", "server.js"]
