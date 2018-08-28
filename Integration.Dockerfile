FROM donbattery/kkhc

WORKDIR /opt

ADD ./test/test_startup.sh .
COPY ./mocks/__mocks__ /__mocks__/
COPY . .
RUN chmod +x test_startup.sh

RUN npm install