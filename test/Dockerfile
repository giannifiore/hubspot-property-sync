FROM node:18-alpine
WORKDIR /usr/src/test
COPY package* .
RUN ["npm", "install"]
COPY . .
CMD ["npm", "run", "start"]