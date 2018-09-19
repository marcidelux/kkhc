import React from 'react';
import {
  View,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { Input } from 'react-native-elements';
import ChatMessageList from './ChatMessageList';

export class ChatScreen extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      keyboardWillShowSub: Keyboard.addListener('keyboardWillShow', this.keyboardWillShow),
      keyboardWillHideSub: Keyboard.addListener('keyboardWillHide', this.keyboardWillHide),
      translateY: new Animated.Value(0),
      bottomTabNavigatorHeight: 54,
    };
  }

  componentDidMount() {
    this.props.screenProps.subscribeToUsersStatus();
  }

  keyboardWillShow = (event: any) => {
    Animated.timing(this.state.translateY, {
      duration: event.duration,
      toValue: -event.endCoordinates.height + this.state.bottomTabNavigatorHeight,
      easing: Easing.inOut(Easing.quad),
    }).start();
  }

  keyboardWillHide = (event: { duration: number }) => {
    Animated.timing(this.state.translateY, {
      duration: event.duration,
      toValue: 0,
      easing: Easing.sin,
    }).start();
  }

  componentWillUnmount() {
    this.state.keyboardWillShowSub.remove();
    this.state.keyboardWillHideSub.remove();
  }

  render() {
    return (
      <Animated.View
        style={{ height: '100%', backgroundColor: 'pink', flex: 1, transform: [{ translateY: this.state.translateY }] }}
      >
        <ChatMessageList
        usersStatus={this.props.screenProps.usersStatus}
        />
        <View style={{ height: this.state.bottomTabNavigatorHeight, backgroundColor: 'purple' }}>
          <Input
            onChangeText={(messageText: string) => this.setState({ messageText })}
            value={this.state.messageText}
            placeholder='Say!'
            placeholderTextColor='black'
            maxLength={20}
            secureTextEntry={true}
          />
        </View>
      </Animated.View>
    );
  }
}
