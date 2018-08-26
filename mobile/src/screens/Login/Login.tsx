import React from 'react';
import {
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
  StyleSheet,
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
  userName: string,
  password: string,
  forgot: string,
  imageHeight: any,
  modalVisible: boolean,
  strokeDashoffset: any,
  // spinValue: any,
  scale: any,
  strokeDasharray: any,
  initAnimation: any,
}> {
  constructor(props: any) {
    super(props);
    this.state = {
      userName: null,
      password: null,
      forgot: null,
      modalVisible: false,
      keyboardWillShowSub: Keyboard.addListener('keyboardWillShow', this.keyboardWillShow),
      keyboardWillHideSub: Keyboard.addListener('keyboardWillHide', this.keyboardWillHide),
      // spinValue: new Animated.Value(0),
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

  // spin() {
  //   this.state.spinValue.setValue(0);
  //   Animated.loop(Animated.timing(
  //     this.state.spinValue, {
  //       toValue: 1,
  //       duration: 8000,
  //       useNativeDriver: true,
  //       easing: Easing.linear,
  //     },
  //   )).start();
  // }

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
    // const spin = this.state.spinValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: ['0deg', '360deg'],
    //   });

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
            onChangeText={(userName: string) => this.setState({ userName })}
            value={this.state.userName}
            placeholder='You...'
            placeholderTextColor='grey'
            maxLength={20}
          />
          <Input
            leftIcon={<Icon name='lock' size={24} color='black'/>}
            style={styles.input}
            onChangeText={(password: string) => this.setState({ password })}
            value={this.state.password}
            placeholder='Secret of Choice!'
            placeholderTextColor='grey'
            maxLength={20}
            secureTextEntry={true}
          />
          <View style={styles.buttonsWrapper}>
            <Button
              onPress={() => this.login()}
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
