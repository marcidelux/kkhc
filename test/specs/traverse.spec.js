const mock = require('mock-fs');
const traverse = require('./../../server/database/traverse');
const { ROOT_FOLDER_HASH } = require('./../../server/constants');

jest.mock('uuid/v4', () => {
  const uuidCounters = ['a', 'b', 'c', 'd', 'e'];
  let index = -1;
  return () => {
    index += 1;
    return uuidCounters[index];
  };
});

describe('should give back tree like structure', () => {
  it("each directory should remember it's path to the root", async () => {
    mock({
      Legacy: {
        first: {
          second: {},
          third: {},
          fourth: {
            fifth: {},
          },
        },
      },
    });
    expect(await traverse('Legacy')).toEqual([
      {
        files: [
          {
            files: [
              {
                files: [],
                hash: 'c',
                hashPath: [ROOT_FOLDER_HASH, 'a', 'b'],
                name: 'fifth',
                path: '/opt/Legacy/first/fourth/fifth',
                type: 'Folder',
              },
            ],
            hash: 'b',
            hashPath: [ROOT_FOLDER_HASH, 'a'],
            name: 'fourth',
            path: '/opt/Legacy/first/fourth',
            type: 'Folder',
          },
          {
            files: [],
            hash: 'd',
            hashPath: [ROOT_FOLDER_HASH, 'a'],
            name: 'second',
            path: '/opt/Legacy/first/second',
            type: 'Folder',
          },
          {
            files: [],
            hash: 'e',
            hashPath: [ROOT_FOLDER_HASH, 'a'],
            name: 'third',
            path: '/opt/Legacy/first/third',
            type: 'Folder',
          },
        ],
        hash: 'a',
        hashPath: [ROOT_FOLDER_HASH],
        name: 'first',
        path: '/opt/Legacy/first',
        type: 'Folder',
      },
    ]);
  });
  mock.restore();
});
