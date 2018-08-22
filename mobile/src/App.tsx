import {
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
} from 'react-navigation';
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
    MainFlow: createBottomTabNavigator({
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
        tabBarOptions: {
          activeTintColor: 'red',
          inactiveTintColor: 'gray',
        },
        navigationOptions: ({ navigation }) => ({
          tabBarIcon: ({ focused }) => {
            const { routeName } = navigation.state;
            const iconSwitcher = {
              News: 'cast',
              Drive: 'box',
              Chat: 'message-square',
              Settings: 'shield',
              Upload: 'aperture',
            };
            return <Icon name={(iconSwitcher as any)[routeName]} size={30} color={focused ? 'red' : 'gray'} />;
          },
        }),
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