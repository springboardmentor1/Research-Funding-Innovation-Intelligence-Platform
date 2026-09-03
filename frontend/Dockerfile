# Stage 1: Build the React/Vite application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built application from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration to enable React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
