import {
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs',
import Icon from 'react-native-vector-icons/Feather';
import React from 'react';

import store from './store';
import { Provider } from 'react-redux';
import { LoginScreen } from './screens/Login/Login';
import { NewsScreen } from './screens/News/News';
import { ImageInspect } from './screens/Drive/components/ImageInspect';
import { SearchScreen } from './screens/Drive/containers/Search';
import { ChatScreen } from './screens/Chat/Chat';
import { SettingsScreen } from './screens/Settings/Settings';
import { UploadScreen } from './screens/Upload/Upload';
import DriveScreen from './screens/Drive/Drive';

const AppNavigation = createSwitchNavigator(
  {
    Login: { screen: LoginScreen },
    MainFlow: createMaterialBottomTabNavigator({
        News: {
          screen: NewsScreen,
        },
        Drive: createStackNavigator({
          screen: DriveScreen,
          ImageInspect: { screen: ImageInspect },
          Search: { screen: SearchScreen },
        }),
        Chat: {
          screen: ChatScreen,
        },
        Settings: {
          screen: SettingsScreen,
        },
        Upload: {
          screen: UploadScreen,
        },
      },
      {
        initialRouteName: 'News',
        shifting: true,
        tabBarColor: 'red',
        barStyle: {
            backgroundColor: '#fbffe4',
        },
        navigationOptions: ({ navigation }) => {
          const { routeName } = navigation.state;
          const styleSwitcher = {
            News: { icon: 'cast', backgroundColor: '#ffffff' },
            Drive: { icon: 'box', backgroundColor: '#fffaff' },
            Chat: { icon: 'message-square', backgroundColor: '#fff5ff' },
            Settings: { icon: 'shield', backgroundColor: '#fff0ff' },
            Upload: { icon: 'aperture', backgroundColor: '#ffebff' },
          };
          return {
            tabBarColor: (() => {
              return (styleSwitcher as any)[routeName].backgroundColor;
            })(),
            tabBarIcon: ({ focused }) => {
              return <Icon name={(styleSwitcher as any)[routeName].icon} size={25} color={focused ? '#ff2d70' : '#98979c'} />;
            },
          };
        },
       },
    )},
  { initialRouteName: 'Login' },
);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
          <AppNavigation />
      </Provider>
    );
  }
}