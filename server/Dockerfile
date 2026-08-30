# ── Stage 1: Install dependencies ──────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first (layer cache — npm install only runs if these change)
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ── Stage 2: Production runner ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user for security (best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure data dir exists for JSON file store (server/data/history.json)
RUN mkdir -p data && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "index.js"]
