FROM node:10.2.1

WORKDIR /opt

ADD ./package.json .
COPY ./backend .
RUN npm install -g pm2
RUN npm install --production
