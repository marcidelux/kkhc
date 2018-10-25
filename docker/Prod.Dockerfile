FROM donbattery/kkhc:latest

WORKDIR /opt

COPY . .

RUN npm i forever -g

RUN npm install

