FROM node:18-alpine
WORKDIR /usr/src/app/server
COPY package.json ./
RUN npm install
COPY . ./
EXPOSE 80
CMD ["npm", "run", "start"]