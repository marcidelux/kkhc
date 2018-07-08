FROM donbattery/kkhc

WORKDIR /opt

COPY . .

COPY server /server

RUN npm install
