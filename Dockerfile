FROM donbattery/kkhc

WORKDIR /opt

ADD ./package.json .
ADD ./startup.sh .

RUN npm install -g nodemon
RUN npm install --production
