FROM donbattery/kkhc

WORKDIR /opt

ADD ./test/test_startup.sh .
COPY . .
RUN chmod +x test_startup.sh

RUN npm install