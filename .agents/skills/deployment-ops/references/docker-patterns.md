# Production-Ready Dockerfile Patterns

## Node.js (Multi-Stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Best Practices
1. **.dockerignore**: Exclude `node_modules`, `.git`, `.env`, `dist`, and `Dockerfile`.
2. **Non-Root**: Always use `USER node` or equivalent.
3. **Small Bases**: `alpine` saves hundreds of MBs and reduces attack surface.
4. **Caching**: Copy `package.json` and `RUN npm install` BEFORE copying the rest of the code to leverage layer caching.
