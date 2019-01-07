FROM donbattery/kkhc

WORKDIR /opt

COPY ./test/mocks/__mocks__ /__mocks__/
COPY ./package.json .
COPY ./jest.config.js .
COPY ./test/test_startup.sh .
COPY ./server ./server/
COPY ./shared ./shared/
COPY ./test/specs ./test/specs
COPY ./test/testAvatars ./test/testAvatars
RUN chmod +x test_startup.sh

RUN npm install