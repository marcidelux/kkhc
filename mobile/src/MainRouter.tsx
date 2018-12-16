import { createStackNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import React from 'react';

import { NewsScreen } from './screens/News/News';
import { ChatScreen } from './screens/Chat/Chat';
import { SettingsScreen } from './screens/Settings';
import { UploadScreen } from './screens/Upload/Upload';
import { DriveScreen } from './screens/Drive/Drive';
import { FileInspect } from './screens/Drive/components/FileInspect';
import { Comments } from './screens/Drive/components/Comments';

export const MainRouter = createMaterialBottomTabNavigator(
    {
      News: {
        screen: NewsScreen,
      },
      Drive: createStackNavigator({
        screen: DriveScreen,
        FileInspect: { screen: FileInspect },
        // Search: { screen: SearchScreen },
        Comments: { screen: Comments },
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
      navigationOptions: ({ navigation }: any) => {
        const { routeName } = navigation.state;
        const styleSwitcher = {
          News: { icon: 'cast', backgroundColor: '#ffffff' },
          Drive: { icon: 'cloud', backgroundColor: '#fffaff' },
          Chat: { icon: 'message-square', backgroundColor: '#fff5ff' },
          Settings: { icon: 'shield', backgroundColor: '#fff0ff' },
          Upload: { icon: 'aperture', backgroundColor: '#ffebff' },
        };
        return {
          tabBarColor: (() => {
            return (styleSwitcher as any)[routeName].backgroundColor;
          })(),
          tabBarIcon: ({ focused }: any) => {
            return (
              <Icon
              name={(styleSwitcher as any)[routeName].icon}
              size={25}
              color={focused ? '#ff2d70' : '#98979c'} />
            );
          },
        };
      },
    },
  );