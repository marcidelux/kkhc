FROM node:10.2.1

WORKDIR /opt

ADD ./package.json .
RUN npm install -g nodemon
RUN npm install --production
