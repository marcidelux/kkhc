FROM donbattery/kkhc

WORKDIR /opt

COPY . .

RUN npm install npm -g

RUN npm install forever -g

RUN npm install
