FROM node:16-alpine3.11

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 4303
EXPOSE 9233

CMD "node index.js"