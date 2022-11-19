FROM node:18-alpine
WORKDIR /usr/src/test
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]