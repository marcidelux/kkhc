import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";

export class SplashScreen extends React.Component {
  login = async () => {
    try {
      let response = await fetch(`https://${process.env.WEB_URL}:3099/auth`, {
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Splash Screen</Text>
        <TouchableOpacity onPress={this.login.bind(this)}>
          <Text>Log me in</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
