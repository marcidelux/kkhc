import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import React from 'react';

import { NewsScreen } from './screens/News/News';
import { ImageInspect } from './screens/Drive/components/ImageInspect';
import { SearchScreen } from './screens/Drive/containers/Search';
import { ChatScreen } from './screens/Chat/Chat';
import { SettingsScreen } from './screens/Settings/Settings';
import { UploadScreen } from './screens/Upload/Upload';
import DriveScreen from './screens/Drive/Drive';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const MainRouter = createMaterialBottomTabNavigator(
  {
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
        Drive: { icon: 'cloud', backgroundColor: '#fffaff' },
        Chat: { icon: 'message-square', backgroundColor: '#fff5ff' },
        Settings: { icon: 'shield', backgroundColor: '#fff0ff' },
        Upload: { icon: 'aperture', backgroundColor: '#ffebff' },
      };
      return {
        tabBarColor: (() => {
          return (styleSwitcher as any)[routeName].backgroundColor;
        })(),
        tabBarIcon: ({ focused }) => {
          return (
            <Icon name={(styleSwitcher as any)[routeName].icon} size={25} color={focused ? '#ff2d70' : '#98979c'} />
          );
        },
      };
    },
  },
);

const subscription = gql`
  subscription {
    userUpdated {
      id
      username
      avatar
      isOnline
      color
    }
  }
`;

const query = gql`
  {
    usersStatus {
      id
      username
      avatar
      isOnline
      color
    }
  }
`;

export default class MainFlow extends React.Component {
  static router = MainRouter.router;

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //   };
  // }

  componentDidMount() {
    // this.props.navigation.setParams({ subscribeToUsersStatus: this.subscribeToUsersStatus });
    // console.log('mount')
  }

  render() {
    return (
      <Query query={query}>
        {({ loading, error, data, subscribeToMore }) => {
          // console.log(subscribeToMore, '    more')
          const { usersStatus } = data;
          console.log(data.usersStatus);

          // console.log(loading, error, subscribeToMore);
          // if (loading)
          //   return (
          //     <View>
          //       <Text>Loading...</Text>
          //     </View>
          //   );
          // if (error)
          //   return (
          //     <View>
          //       <Text>error: {error.message}</Text>
          //     </View>
          //   );
          const subscribeToUsersStatus = () =>
            subscribeToMore({
              document: subscription,
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const { userUpdated } = subscriptionData.data;
                console.log('refreshing users');
                // console.log(userUpdated)
                //   console.log(subscriptionData.data)
                //   if (mutation !== 'CREATED') return prev;
                return Object.assign({}, prev, {
                  usersStatus: [...prev.usersStatus].map((user) => user.id === userUpdated.id ? userUpdated : user),
                });
              },
            });
          return (
            <MainRouter navigation={this.props.navigation} screenProps={{subscribeToUsersStatus, usersStatus}}/>
          );
        }}
      </Query>
    );
  }
}
