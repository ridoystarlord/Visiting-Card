# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install necessary system packages
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Generate Prisma client
FROM node:20-alpine AS prisma-generator
WORKDIR /app

# Install necessary system packages
RUN apk add --no-cache openssl

# Copy necessary files from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma
COPY package*.json ./
COPY yarn.lock ./

# Generate Prisma client
RUN npx prisma generate

# Stage 3: Build application
FROM node:20-alpine AS builder
WORKDIR /app

# Install necessary system packages
RUN apk add --no-cache openssl

# Copy all necessary files
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=prisma-generator /app/node_modules/@prisma ./node_modules/@prisma
COPY . .

# Build the application
RUN yarn run build

# Stage 4: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Install necessary system packages
RUN apk add --no-cache openssl

# Install PM2 globally
RUN npm install -g pm2

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=prisma-generator /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY yarn.lock ./

# Ensure correct permissions
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port and start application
EXPOSE 6001
# CMD ["node", "dist/main"]
# CMD ["pm2-runtime", "start", "dist/main.js", "-i", "max"]
COPY pm2.config.js ./
CMD ["pm2-runtime", "pm2.config.js"]
