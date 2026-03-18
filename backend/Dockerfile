# --- STAGE 1: Build & Compile ---
# We use Alpine for a small footprint, but we need build tools for better-sqlite3
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Install build dependencies (required to compile C++ native bindings for SQLite)
RUN apk add --no-cache python3 make g++

# 2. Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# 3. Install ALL dependencies (including devDependencies for the build step)
# Note: We use 'npm install' because this backend is part of a workspace 
# and doesn't have its own package-lock.json
RUN npm install

# 4. Copy the rest of the source code
COPY . .

# 5. Build the TypeScript project into the /dist folder
RUN npm run build

# 6. Remove development dependencies to keep the node_modules lean
RUN npm prune --omit=dev


# --- STAGE 2: Lightweight Production Image ---
FROM node:20-alpine
WORKDIR /app

# 7. Copy only the necessary production artifacts from the builder stage
# This keeps the final image size minimal and secure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# 8. Create a persistent directory for the SQLite database file
RUN mkdir -p /app/data

# 9. Set network environment variables
ENV PORT=3001
EXPOSE 3001

# 10. Start the application
CMD ["node", "dist/index.js"]