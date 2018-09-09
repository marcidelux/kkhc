
// import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';
import { BACKEND_API } from 'react-native-dotenv';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloClient } from 'apollo-client';

import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpLink = new HttpLink({
    uri: `${BACKEND_API}/mobile`,
});
const wsLink = new WebSocketLink({
    uri: `ws://10.1.10.17:3099/subscriptions`,
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
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });
export default client;