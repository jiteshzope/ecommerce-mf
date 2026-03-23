# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npx nx build api --configuration=production

# Runtime stage — slim node image (no nginx needed)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/api ./
RUN npm ci --omit=dev --prefer-offline
EXPOSE 3000
CMD ["node", "main.js"]
