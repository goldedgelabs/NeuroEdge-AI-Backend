FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .

ENV PORT=7002
EXPOSE 7002

CMD ["node", "dist/src/app.js"]
