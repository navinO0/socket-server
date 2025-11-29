# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm ci --production

COPY . .

ENV PORT=3008
EXPOSE 3008

CMD ["node", "main.js"]
