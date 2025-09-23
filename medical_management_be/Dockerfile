FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package.json và yarn.lock
COPY package.json ./
COPY yarn.lock ./

# Cài đặt dependencies
RUN yarn install

# Copy source code
COPY . .
RUN npx prisma generate
# Build ứng dụng
RUN yarn build

# Tạo Prisma client


# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Cài đặt các dependencies cần thiết cho production
RUN apk add --no-cache libc6-compat

# Copy các file cần thiết từ builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 9944

# Khởi chạy ứng dụng
CMD ["node", "dist/main.js"] 