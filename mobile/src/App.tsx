import 'es6-symbol/implement';
import {
  createSwitchNavigator,
} from 'react-navigation';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import client from './client';

import store from './store';
import { Provider } from 'react-redux';
import { LoginScreen } from './screens/Login/Login';
import MainFlow from './MainFlow';

const AppNavigation = createSwitchNavigator(
  {
    Login: { screen: LoginScreen },
    MainFlow: { screen: MainFlow },
  },
  { initialRouteName: 'Login' },
);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <ApolloProvider client={client}>
          <AppNavigation />
        </ApolloProvider>
      </Provider>
    );
  }
}