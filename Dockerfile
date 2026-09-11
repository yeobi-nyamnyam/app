FROM node:22-slim

WORKDIR /repo
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter server build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "apps/server/dist/index.js"]
