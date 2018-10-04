import React from 'react';
import {
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  Animated,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import { Input, Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const CHANGE_PASSWORD = gql`
mutation($userId: ID!, $oldPassword: String!, $newPassword: String!) {
  changePassword(userId: $userId, oldPassword: $oldPassword, newPassword: $newPassword)
}
`;

const screen = Dimensions.get('window');

export class SystemSettings extends React.Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      responseAnimation: new Animated.Value(0),
      ...this.initialPasswordValues(),
    };
  }

  initialPasswordValues() {
    return ({
      oldPassword: null,
      newPassword: null,
    }as any);
  }

  setNewPassword(changePassword) {
    const { oldPassword, newPassword } = this.state;
    changePassword({ variables: {
      userId: this.props.userId,
      oldPassword,
      newPassword,
    } });
  }

  handleResponse(data: any) {
    this.animateResponse(data);
    if (data.changePassword) {
      this.setState(this.initialPasswordValues());
    }
  }

  animateResponse(data: any) {
    if (data && (data.changePassword || data.changePassword === false)) {
      Animated.timing(this.state.responseAnimation, {
        toValue: 1,
        duration: 1000,
      }).start(
        this.state.responseAnimation.setValue(0),
      );
    }
  }

  validatePasswords() {
    if (this.state.oldPassword && this.state.newPassword) {
      // @todo make global validation of inputs
      return this.validatePassword(this.state.oldPassword) && this.validatePassword(this.state.newPassword);
    }
    return false;
  }

  validatePassword(password: String): Boolean {
    return password.length >= 6;
  }

  calculatePasswordLengthFeedback(password) {
    return password
    ? `${this.validatePassword(password) ? 90 : password.length * 15}%`
    : 0;
  }

  toggleWidget() {
    this.setState(this.initialPasswordValues());
    Keyboard.dismiss();
    setTimeout(() => this.props.toggle());
  }

  renderPagination(index: number) {
    const iconContainerWidth = 40;
    const parentWidth = screen.width - 50;
    const parentPadding = 10;
    return (
      <TouchableOpacity
        onPress={() => Keyboard.dismiss()}
        activeOpacity={1}
        style={styles.paginationWrapper}>
        <View
          style={[styles.paginationInner, {
            width: iconContainerWidth,
            transform: [{translateX: -((parentWidth - parentPadding) / 2) + (iconContainerWidth / 2)}],
          }]}>
          {['lock', 'settings']
            .map((iconName, i) => (
            <Icon key={iconName} name={iconName} size={18} color={index === i ? '#5c63d8' : 'grey'}/>
            ))}
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      isVisible,
    } = this.props;

    const responseOpacity = this.state.responseAnimation.interpolate({
      inputRange: [0, .2, .8, 1],
      outputRange: [0, 1, 1, 0],
    });

    return (
      <Modal
        style={{ justifyContent: 'flex-end' }}
        isVisible={isVisible}
        onBackdropPress={() => this.toggleWidget()}
        animationInTiming={500}
        animationOutTiming={500}
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={500}
        avoidKeyboard={true}>

        <View style={styles.innerModalContainer}>
          <TouchableOpacity style={{ width: 25 }} onPress={() => this.toggleWidget()}>
            <View>
              <Icon name={'x'} size={25} color={'#000'} />;
            </View>
          </TouchableOpacity>

          <Swiper
            bounces={true}
            keyboardShouldPersistTaps='handled'
            renderPagination={this.renderPagination}
            loop={false}
            onIndexChanged={() => Keyboard.dismiss()}>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => Keyboard.dismiss()}
              style={styles.swiperView}>
              <Mutation
                mutation={CHANGE_PASSWORD}
                onCompleted={(data) => this.handleResponse(data)}>
                {(changePassword, { data, loading, error }) => {
                  return (
                  <View style={styles.swiperView}>
                    <Text>password</Text>
                    <Input
                      onSubmitEditing={() => this.validatePasswords()
                        ? this.setNewPassword(changePassword)
                        : null}
                        // @todo password length is not valid |> error handling
                      style={styles.input}
                      onChangeText={(oldPassword: string) => this.setState({ oldPassword })}
                      value={this.state.oldPassword}
                      placeholder='old pass'
                      placeholderTextColor='grey'
                      maxLength={40}
                      returnKeyType='send'
                      secureTextEntry={true}
                      />
                      <View
                        style={[
                        styles.passwordLengthFeedback, {
                          width: this.calculatePasswordLengthFeedback(this.state.oldPassword),
                          transform: [{translateY: 57}],
                        }]}/>
                    <Input
                      onSubmitEditing={() => this.validatePasswords()
                        ? this.setNewPassword(changePassword)
                        : null}
                      style={styles.input}
                      onChangeText={(newPassword: string) => this.setState({ newPassword })}
                      value={this.state.newPassword}
                      placeholder='new pass'
                      placeholderTextColor='grey'
                      maxLength={40}
                      returnKeyType='send'
                      secureTextEntry={true}
                    />
                    <View
                      style={[
                      styles.passwordLengthFeedback, {
                        width: this.calculatePasswordLengthFeedback(this.state.newPassword),
                        transform: [{translateY: 97.9}],
                      }]}/>
                    <View style={styles.passwordSetButtonWrapper}>
                      <Button
                        disabled={!this.validatePasswords()}
                        disabledStyle={[styles.button, { opacity: .3 }]}
                        disabledTitleStyle={{fontSize: 14, color: '#e63e5c'}}
                        onPress={() => this.setNewPassword(changePassword)}
                        icon={
                        <Icon
                          style={{marginLeft: 5}}
                          name={this.validatePasswords() ? 'check' : 'eye'}
                          size={24}
                          color='#000'/>
                        }
                        title='set'
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                        containerStyle={styles.passwordSetButtonContainer}
                      />
                      {loading && <ActivityIndicator size='small' color='#000' />}
                      {data && (data.changePassword || data.changePassword === false) && (
                        <Animated.Text
                          style={{
                            alignSelf: 'center',
                            opacity: responseOpacity,
                            color: data.changePassword ? '#50ad34' : '#e63e5c',
                          }}>
                          {data.changePassword ? 'success' : 'wrong password'}
                        </Animated.Text>
                      )}
                    </View>
                  </View>
                  );
                }}
              </Mutation>
            </TouchableOpacity>

            <View style={styles.swiperView}>
              <Text>system</Text>
              <Button
                // @todo can login - unsubscribe etc...
                // onPress={() => this.logout()}
                icon={<Icon style={{marginLeft: 5}} name='log-out' size={24} color='#000'/>}
                title='log out'
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                containerStyle={{marginTop: 12.5}}
              />
            </View>

          </Swiper>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  innerModalContainer: {
    padding: 5,
    borderRadius: 7.5,
    opacity: 0.95,
    alignSelf: 'center',
    width: screen.width - 50,
    height: screen.height / 3,
    bottom: 25,
    backgroundColor: '#c0c0c0',
  },
  paginationWrapper: {
    top: -20,
    width: '90%',
    alignSelf: 'flex-end',
    position: 'absolute',
    flex: 1,
  },
  paginationInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
  },
  swiperView: { flex: 1, alignItems: 'center', width: '100%' },
  input: { height: 25, borderColor: 'black', borderWidth: 1 },
  button: {
    height: 35,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  passwordLengthFeedback: {
    height: .7,
    backgroundColor: '#5c63d8',
    alignSelf: 'flex-start',
    marginLeft: 12.5,
    position: 'absolute',
  },
  buttonTitle: { fontSize: 14, color: '#000'},
  passwordSetButtonWrapper: { flex: 1, flexDirection: 'row', alignSelf: 'flex-start' },
  passwordSetButtonContainer: { marginTop: 12.5, marginLeft: 14, marginRight: 10, alignSelf: 'flex-start' },
});