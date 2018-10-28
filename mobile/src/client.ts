import { BACKEND_API, SUBSCRIPTIONS_API } from 'react-native-dotenv';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloClient } from 'apollo-client';

import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

import CONSTANTS from './constants';

const httpLink = new HttpLink({
  uri: BACKEND_API + CONSTANTS.GRAPHQL_ENDPOINT,
});

const wsLink = new WebSocketLink({
  uri: SUBSCRIPTIONS_API + CONSTANTS.GRAPHQL_SUBSCRIPTIONS,
  options: {
    reconnect: true,
  },
});
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);
const cache = new InMemoryCache({
  fragmentMatcher: new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
      __schema: {
        types: [
          {
            kind: 'UNION',
            name: 'FolderContent',
            possibleTypes: [
              {
                name: CONSTANTS.DRIVE_FILES.FOLDER.TYPE,
              },
              {
                name: CONSTANTS.DRIVE_FILES.IMAGE.TYPE,
              },
            ],
          },
          {
            kind: 'INTERFACE',
            name: 'TagBody',
            possibleTypes: [
              {
                name: 'TagPrimitive',
              },
              {
                name: 'Tag',
              },
            ],
          },
        ],
      },
    },
  }),
});
const client = new ApolloClient({ link, cache });
export default client;
