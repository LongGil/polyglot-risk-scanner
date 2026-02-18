# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine as backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine
WORKDIR /app

# Copy Frontend Build
COPY --from=frontend-builder /app/dist ./dist

# Copy Backend Build
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/package*.json ./server/
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Expose Port
EXPOSE 3001

# Start Server
WORKDIR /app/server
CMD ["node", "dist/index.js"]
