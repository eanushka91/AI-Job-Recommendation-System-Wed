# ---- Stage 1: Build ----
# Use an official Node.js runtime as a parent image for the build stage
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This allows Docker to leverage caching for the npm install step
COPY package*.json ./

# Install project dependencies
# Using --frozen-lockfile or --ci is recommended for reproducible builds
RUN npm install --ci

# Copy the rest of your project files to the working directory
COPY . .

# Build the React application for production
# This runs the "build" script from your package.json
RUN npm run build

# ---- Stage 2: Serve ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine

# Copy the build output (static files) from the 'build' stage's /app/dist directory
# to Nginx's default web root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to allow traffic to Nginx (Nginx listens on port 80 by default)
EXPOSE 80

# Start Nginx in the foreground when the container launches
CMD ["nginx", "-g", "daemon off;"]
