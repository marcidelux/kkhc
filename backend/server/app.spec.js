import Rootserver from './RootServer';
const request = require('supertest');
const assert = require('assert');

const PORT = 3099;

describe('testing module initialise', () => {
    const rootServer = new Rootserver(PORT);
    rootServer.init();

    xit('to /newsale server status is 200', () => {
        return request(rootServer.app).post('/newsale').then((response) => {
            expect(response.statusCode).toBe(200);
        });
    });

    xit('to /newsale server responds with status ok', () => {
        return request(rootServer.app)
            .post('/newsale')
            .set('Accept', 'application/json')
            .send({ user: 'superuser',
                amount: 1,
                upfront: true,
                soldItem: 'this',
                date: '2018-05-17T18:28:56.732Z',
                sellTo: 'you',
            })
            .expect(200)
            .then((response) => {
                assert(response.body.status, 'ok');
            });
    });

    afterEach(() => {
        rootServer.close();
    });
});

