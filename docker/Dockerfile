FROM donbattery/kkhc

WORKDIR /opt

ADD package.json .
ADD server/startup.sh .

RUN npm install -g nodemon
RUN npm install
