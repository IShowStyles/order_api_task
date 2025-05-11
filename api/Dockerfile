FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["npm", "start"]