import React from 'react';
import { View, Text, AsyncStorage, Animated, Easing } from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';
import { Avatar } from 'react-native-elements';

export class SettingsScreen extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      meId: null,
      spinValue: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    this.props.screenProps.subscribeToUsersStatus();
    this.spin();
    try {
      const meId = await AsyncStorage.getItem('loggedInUserId');
      this.setState({ meId });
    } catch (error) {
      console.log(error);
    }
  }

  spin() {
    Animated.loop(
      Animated.timing(this.state.spinValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  }

  render() {
    if (!this.state.meId) return null;
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    const me = this.props.screenProps.usersStatus
      .find((user: any) => user.id === this.state.meId);
    return (
      <View style={{ marginTop: 50 }}>
        <Text>{me.color}</Text>
        <Text>{me.username}</Text>
        <Animated.View style={{ transform: [{ rotate: spin }], left: 100, width: 0, height: 0 }}>
          <Avatar
            size='large'
            rounded
            avatarStyle={{ opacity: 0.7, transform: [{ scale: 0.9 }] }}
            source={{ uri: `${BACKEND_API}/opt/server/avatars/${me.avatar}.png` }}
            containerStyle={{ backgroundColor: me.color }}
          />
        </Animated.View>
      </View>
    );
  }
}
