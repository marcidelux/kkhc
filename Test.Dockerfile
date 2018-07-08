FROM donbattery/kkhc

WORKDIR /opt

ADD ./package.json .
ADD ./test/test_startup.sh .
RUN chmod +x test_startup.sh

RUN npm install