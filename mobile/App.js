import React from 'react';

import { createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import { HomeScreen } from './screens/Home';
import { SplashScreen } from './screens/Splash';


export default createStackNavigator({
    Home: {
      screen: HomeScreen,
    },
    Splash: {
      screen: SplashScreen,
    },
  },
  {
    initialRouteName: 'Splash',
  });