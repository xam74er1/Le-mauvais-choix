# --- Build Stage ---
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm ci
    
    # Copy source and build
    COPY . .
    RUN npm run build
    
    # Remove dev dependencies to reduce final image size
    RUN npm prune --omit=dev
    
    
    # --- Production Stage ---
    FROM nginx:alpine
    
    # Copy built assets from build stage
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Copy nginx config (make sure you have this file locally)
    COPY nginx.conf /etc/nginx/nginx.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    