# ---- Builder Stage ----
# Build the Vite project for production
FROM node:20 AS builder

WORKDIR /app

# Enable pnpm with fixed version (stable cache)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Copy dependency definition files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (use BuildKit cache for pnpm store)
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the project (use Vite only; run typecheck in CI/local)
# Increase Node heap to avoid OOM; disable sourcemaps to reduce I/O
ENV NODE_ENV=production
ENV VITE_BUILD_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=4096

# Cache Vite artifacts between builds (requires BuildKit)
RUN --mount=type=cache,target=/root/.pnpm-store \
    --mount=type=cache,target=/root/.cache/vite \
    pnpm vite build

# ---- Production Stage ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.25-alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
# This file configures Nginx to serve the SPA and proxy API requests
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# The default Nginx command will be used to start the server
CMD ["nginx", "-g", "daemon off;"]
