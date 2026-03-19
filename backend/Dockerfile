# --- STAGE 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Install build tools for native modules (like better-sqlite3)
RUN apk add --no-cache python3 make g++ git

# 2. Copy root package files (essential for workspaces)
COPY package*.json ./

# 3. Copy the backend workspace specifically
COPY backend/ ./backend/

# 4. Install dependencies using the workspace flag
# This looks at root package-lock.json but installs only backend needs
RUN npm install -w backend

# 5. Build the backend project
RUN npm run build -w backend

# 6. Remove devDependencies
RUN npm prune --omit=dev -w backend


# --- STAGE 2: Runtime ---
FROM node:20-alpine
WORKDIR /app

# 7. Copy production artifacts
# Note: node_modules for workspaces are usually in the root
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json

# 8. Setup database directory
RUN mkdir -p /app/data

ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js"]