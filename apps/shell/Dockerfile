# Build stage — need full monorepo for Nx
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npx nx build shell --configuration=production

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist/apps/shell /usr/share/nginx/html
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
