FROM node:16-alpine3.11

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ./

COPY . .

EXPOSE 9229

CMD ["node", "--inspect=0.0.0.0:9229", "index.js"]
