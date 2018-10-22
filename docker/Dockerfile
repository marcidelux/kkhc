FROM donbattery/kkhc

WORKDIR /opt

COPY package.json .

COPY server/startup.sh .

RUN npm install -g nodemon

RUN npm install
