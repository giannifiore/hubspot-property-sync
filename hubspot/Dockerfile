#!/bin/bash
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /usr/src/hubspot
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start"]