import React from 'react';
import {
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
  StyleSheet,
  AsyncStorage,
} from 'react-native';
import { Input, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Path } from 'react-native-svg';
import { BACKEND_API } from 'react-native-dotenv';
import { ForgotPassword } from './ForgotPassword';
import kkhcLogoSvgPath from './../../static/kkhcLogoSvg';

export class LoginScreen extends React.Component<any, {
  keyboardWillShowSub: any,
  keyboardWillHideSub: any,
  email: string,
  password: string,
  forgot: string,
  imageHeight: any,
  modalVisible: boolean,
  strokeDashoffset: any,
  scale: any,
  strokeDasharray: any,
  initAnimation: any,
}> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: null,
      password: null,
      forgot: null,
      modalVisible: false,
      keyboardWillShowSub: Keyboard.addListener('keyboardWillShow', this.keyboardWillShow),
      keyboardWillHideSub: Keyboard.addListener('keyboardWillHide', this.keyboardWillHide),
      imageHeight: new Animated.Value(250),
      scale: new Animated.Value(1),
      strokeDashoffset: 1500,
      strokeDasharray: 2500,
      initAnimation: null,
    };
  }

  componentWillUnmount() {
    this.state.keyboardWillShowSub.remove();
    this.state.keyboardWillHideSub.remove();
    clearInterval(this.state.initAnimation);
  }

  componentDidMount() {
    this.setState({
      initAnimation: setInterval(() => {
        this.setState({
          strokeDashoffset: this.state.strokeDashoffset - 15,
        });
        if (this.state.strokeDashoffset === 0) clearInterval(this.state.initAnimation);
        }, 1),
    });
  }

  setModalVisible(modalVisible: boolean) {
    this.setState({ modalVisible });
  }

  keyboardWillShow = (event: { duration: number }) => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: 120,
      easing: Easing.poly(.6),
    }).start();
    Animated.timing(this.state.scale, {
      duration: event.duration,
      toValue: .3,
      easing: Easing.poly(.6),
    }).start();
  }

  keyboardWillHide = (event: { duration: number }) => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: 250,
      easing: Easing.elastic(.8),
    }).start();
    Animated.timing(this.state.scale, {
      duration: event.duration,
      toValue: 1,
      easing: Easing.elastic(.8),
    }).start();
  }

  login = async () => {
    const { email, password } = this.state;
    try {
      let response = await fetch(`${BACKEND_API}/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          query: `mutation($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              status,
              userId,
            }
          }`,
          variables: {
            email: 'andrasnyarai@gmail.com',
            password: 'kacsa',
          },
        })
      });
      const { data } = await response.json();
      await this.handleClientLogin(data);

    } catch (error) {
      console.error(error);
    }
  }

  handleClientLogin = async (data: any) => {
    if (data) {
      const { login: { status, userId } } = data;
      if (status) {
        try {
          await AsyncStorage.setItem('loggedInUserId', userId);
          this.props.navigation.navigate('MainFlow');
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log('password or email is incorrect');
      }
    }
  }

  render() {

    return (
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}>
      <View style={styles.main}>

        <ForgotPassword
        setModalVisible={this.setModalVisible.bind(this)}
        modalVisible={this.state.modalVisible}/>

        <Animated.View style={{
          transform: [{scale: this.state.scale}],
          height: this.state.imageHeight,
          }}>
          <Svg
            height='250'
            width='250'>
            <Path d={kkhcLogoSvgPath}
             stroke='#000'
             fill='#fff'
             strokeWidth='2'
             strokeDashoffset={-this.state.strokeDashoffset}
             strokeDasharray={[this.state.strokeDasharray]}
             />
          </Svg>
        </Animated.View>

          <Text>is dead</Text>
          <Input
            leftIcon={<Icon name='user' size={24} color='black'/>}
            style={styles.input}
            onChangeText={(email: string) => this.setState({ email })}
            value={this.state.email}
            placeholder='You@...'
            keyboardType={'email-address'}
            placeholderTextColor='grey'
            maxLength={40}
          />
          <Input
            leftIcon={<Icon name='lock' size={24} color='black'/>}
            style={styles.input}
            onChangeText={(password: string) => this.setState({ password })}
            value={this.state.password}
            placeholder='Secret of Choice!'
            placeholderTextColor='grey'
            maxLength={40}
            secureTextEntry={true}
          />
          <View style={styles.buttonsWrapper}>
            <Button
              onPress={() => {
                if (this.state.email && this.state.password) {
                  this.login();
                }
              }}
              icon={<Icon name='anchor' size={24} color='white'/>}
              title={'log me in'}
              buttonStyle={[styles.loginButton, styles.button]}
              containerStyle={styles.buttonContainer}
            />
            <Button
              onPress={() => this.setModalVisible(true)}
              icon={<Icon name='mail' size={24} color='white'/>}
              title={'i\'m lost'}
              buttonStyle={[styles.forgotButton, styles.button]}
              containerStyle={styles.buttonContainer}
            />
          </View>
        </View>
        </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  main : { flex: 1, alignItems: 'center', paddingTop: 30 },
  input: { height: 40, width: 150, borderColor: 'black', borderWidth: 1 },
  buttonsWrapper : {
    width: '90%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    height: 45,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 5,
  },
  loginButton: { backgroundColor: '#5c63d8' },
  forgotButton: { backgroundColor: '#e80c7a' },
  buttonContainer: { marginTop: 5, width: '49%' },
});
