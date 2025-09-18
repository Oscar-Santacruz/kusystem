# ---- Builder Stage ----
# Build the Vite project for production
FROM node:20 AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy dependency definition files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the project
# The output will be in the /app/dist directory
RUN pnpm build

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
