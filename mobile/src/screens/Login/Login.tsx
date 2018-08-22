import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';

export class LoginScreen extends React.Component<any, { userName: string; password: string }> {
  constructor(props: any) {
    super(props);
    this.state = {
      userName: null,
      password: null,
    };
  }

  login = async () => {
    try {
      // let response = await fetch(`${BACKEND_API}/auth`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     password: '123',
      //     email: 'asd@wasd.gov'
      //   }),
      //   headers: {
      //     'Content-Type': 'application/json; charset=utf-8'
      //   }
      // });
      // let { Success } = await response.json();
      // if (Success) {
      this.props.navigation.navigate('MainFlow');
      // }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', top: -25 }}>
        <Text>Brelcome</Text>
        <TextInput
          style={{ height: 40, width: 100, borderColor: 'black', borderWidth: 1 }}
          onChangeText={(userName) => this.setState({ userName })}
          value={this.state.userName}
          // onSubmitEditing={this.addComment}
          placeholder='You...'
          placeholderTextColor='grey'
          maxLength={20}
          keyboardAppearance='dark'
        />
        <TextInput
          style={{ height: 40, width: 100, borderColor: 'black', borderWidth: 1 }}
          onChangeText={(password) => this.setState({ password })}
          value={this.state.password}
          // onSubmitEditing={this.addComment}
          placeholder='Secret of Choice!'
          placeholderTextColor='grey'
          maxLength={20}
          keyboardAppearance='dark'
          secureTextEntry={true}
        />
        <TouchableOpacity onPress={this.login.bind(this)}>
          <Text>Log me in</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
