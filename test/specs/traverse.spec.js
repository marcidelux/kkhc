const mock = require('mock-fs');
const traverse = require('./../../server/database/traverse');

describe('should give back tree like structure', () => {
  it('each directory should remember it\'s path to the root', () => {
    mock({
      zero: {
        first: {
          second: {},
          third: {},
          fourth: {
            fifth: {},
          },
        },
      },
    });
    expect(traverse('zero')).toEqual([
      {
        files: [
          {
            files: [
              {
                files: [],
                hash: 3,
                hashPath: [0, 1, 2],
                name: 'fifth',
                path: '/opt/zero/first/fourth/fifth',
                type: 'Folder',
              },
            ],
            hash: 2,
            hashPath: [0, 1],
            name: 'fourth',
            path: '/opt/zero/first/fourth',
            type: 'Folder',
          },
          {
            files: [],
            hash: 4,
            hashPath: [0, 1],
            name: 'second',
            path: '/opt/zero/first/second',
            type: 'Folder',
          },
          {
            files: [],
            hash: 5,
            hashPath: [0, 1],
            name: 'third',
            path: '/opt/zero/first/third',
            type: 'Folder',
          },
        ],
        hash: 1,
        hashPath: [0],
        name: 'first',
        path: '/opt/zero/first',
        type: 'Folder',
      },
    ]);
  });
  mock.restore();
});
