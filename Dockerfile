# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Career Match — single image: React build + Node.js/Express API
# Build:  docker build -t career-match .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build the React frontend ───────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: production runtime (Express serves API + built React app) ──────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY backend/ ./
# server.js looks for ../frontend/dist relative to /app/backend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Run as the unprivileged "node" user that ships with the image
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
