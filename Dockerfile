# Syntax: https://docs.docker.com/build/buildkit/
# ---- build stage: install deps & produce standalone Next.js build ----
FROM node:22-alpine AS build
WORKDIR /app

# Install only the prod deps first so layer caching stays fast.
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
# Prisma client generation + Next standalone output
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# standalone Next.js server + Prisma CLI for migrations
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]