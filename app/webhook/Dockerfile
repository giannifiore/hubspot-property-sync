FROM node:18-alpine
WORKDIR /usr/src/webhook
COPY package* .
RUN ["npm", "install"]
COPY . .
CMD ["npm", "run", "start"]