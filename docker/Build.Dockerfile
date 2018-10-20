FROM donbattery/kkhc

WORKDIR /opt

COPY . .

RUN npm install
