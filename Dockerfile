FROM --platform=linux/amd64 node:18.1.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 80

CMD [ "node", "index.mjs" ]
