FROM donbattery/kkhc

WORKDIR /opt

COPY . .

RUN npm install

RUN npm install pm2 -g
