FROM donbattery/kkhc

WORKDIR /opt

COPY ./mocks/__mocks__ /__mocks__/
ADD ./package.json .
ADD ./jest.config.js .
ADD ./test/test_startup.sh .
COPY ./server ./server/
COPY ./test ./test/
COPY ./data ./data/
COPY ./www ./www/
RUN chmod +x test_startup.sh

RUN npm install