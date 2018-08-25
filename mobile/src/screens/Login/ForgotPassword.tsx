import React from 'react';
import { View, Text, TouchableHighlight, Modal, Alert, StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import { BACKEND_API } from 'react-native-dotenv';

export class ForgotPassword extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      forgot: null,
    };
  }

  forgotEmailWrapper(email: string) {
    this.forgotEmail(email).then(({ message, error }: { message: string; error: string }) => {
      setTimeout(() => Alert.alert(message ? '\u270C' : '\u270B', message || error), 1000);
    });
  }

  async forgotEmail(email: string): Promise<object | void> {
    try {
      const response = await fetch(`${BACKEND_API}/forgotPassword/`, {
        method: 'PUT',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      return response.json();
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <Modal animationType='slide' transparent={false} visible={this.props.modalVisible}>
        <View style={styles.main}>

          <TouchableHighlight
            underlayColor={'red'}
            onPress={() => this.props.setModalVisible(!this.props.modalVisible)}>
            <View>
              <Icon name={'x'} size={35} color={'#ffffff'} />;
            </View>
          </TouchableHighlight>

          <View style={styles.sub}>
            <Text style={styles.text}>
              Enter email below to send you a spam, also with it you can reset your password
            </Text>
            <Input
              leftIcon={<Icon name='at-sign' size={24} color='black' />}
              style={styles.input}
              onChangeText={(forgot: string) => this.setState({ forgot })}
              value={this.state.forgot}
              shake={true}
              autoFocus={true}
              onSubmitEditing={() => {
                this.props.setModalVisible(!this.props.modalVisible);
                this.forgotEmailWrapper(this.state.forgot);
              }}
              placeholderTextColor='white'
              keyboardType={'email-address'}
              keyboardAppearance='dark'
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    marginTop: 22,
    backgroundColor: 'red',
    opacity: 0.7,
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  sub: { flex: 1, alignItems: 'center', width: '100%' },
  text: { fontSize: 30 },
  input: {
    height: 50,
    width: 150,
    borderColor: 'white',
    borderWidth: 1,
    color: 'white',
    marginTop: 10,
  },
});
