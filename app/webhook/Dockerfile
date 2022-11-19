FROM node:18-alpine
WORKDIR /usr/src/webhook
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]