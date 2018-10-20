FROM donbattery/kkhc

WORKDIR /opt

COPY . .

RUN npm install

RUN npm install forever -g
