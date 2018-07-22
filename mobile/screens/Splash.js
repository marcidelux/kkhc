import React from "react";
import { View, Text, Button, TouchableOpacity, TextInput } from "react-native";

export class SplashScreen extends React.Component {
  state = {

  }
  login = async () => {
    try {
      let response = await fetch(`http://192.168.0.15:3099/auth`, {
        method: "POST",
        body: JSON.stringify({
          password: "123",
          email: "asd@wasd.gov"
        }),
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      });
      let { Success } = await response.json();
      // if (Success) {
      this.props.navigation.navigate("Home");
      // }
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", top: -25 }}>
        <Text>Brelcome</Text>
        <TextInput
            style={{ height: 40, width: 100, borderColor: "black", borderWidth: 1 }}
            onChangeText={userName => this.setState({ userName })}
            value={this.state.userName}
            // onSubmitEditing={this.addComment}
            placeholder="You..."
            placeholderTextColor="grey"
            maxLength={20}
            keyboardAppearance='dark'
            onfocus={this.shiftUp}
          />
          <TextInput
            style={{ height: 40, width: 100, borderColor: "black", borderWidth: 1 }}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
            // onSubmitEditing={this.addComment}
            placeholder="Secret of Choice!"
            placeholderTextColor="grey"
            maxLength={20}
            keyboardAppearance='dark'
            secureTextEntry={true}
            onfocus={this.shiftUp}
          />
        <TouchableOpacity onPress={this.login.bind(this)}>
          <Text>Log me in</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
