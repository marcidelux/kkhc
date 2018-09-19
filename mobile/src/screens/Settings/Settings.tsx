import React from 'react';
import {
  View,
  Text,
  AsyncStorage,
  Animated,
  Easing,
  Image,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';
import { Slider, Input, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import { ColorSliders } from './ColorSliders';

enum RGB {
  red,
  green,
  blue,
}

const screen = Dimensions.get('window');
const TOP_OFFSET = 30;
const INDICATOR_SIZE = 40;
export class SettingsScreen extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      meId: null,
      locationX: new Animated.Value((screen.width - 100) / 2),
      locationY: new Animated.Value(50),
      jiggle: new Animated.Value(0),
      indicatorX: 0,
      indicatorY: 0,
      indicatorSize: new Animated.Value(0),
      indicatorOpacity: new Animated.Value(0),
      localUsername: null,
      localAvatar: null,
      localColor: null,
      red: null,
      green: null,
      blue: null,
    };
  }

  async componentDidMount() {
    this.props.screenProps.subscribeToUsersStatus();
    this.jiggle();
    try {
      const meId = await AsyncStorage.getItem('loggedInUserId');
      this.setState({ meId });
    } catch (error) {
      console.log(error);
    }
  }

  jiggle() {
    Animated.loop(
      Animated.timing(this.state.jiggle, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.43, 0.47, 0.61),
      }),
    ).start();
  }

  move(e) {
    this.refreshIndicator();
    const { locationX, locationY, pageX, pageY } = e.nativeEvent;

    this.setState({
      indicatorX: pageX,
      indicatorY: pageY,
    });

    let distanceX = Math.abs(this.state.locationX.__getValue() - locationX);
    let distanceY = Math.abs(this.state.locationY.__getValue() - locationY);

    const duration = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    Animated.parallel([
      Animated.timing(this.state.locationX, {
        duration: duration * 2.5,
        toValue: locationX,
      }),
      Animated.timing(this.state.locationY, {
        duration: duration * 2.5,
        toValue: locationY,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(this.state.indicatorSize, {
        duration: duration * 2,
        toValue: INDICATOR_SIZE,
      }),
      Animated.timing(this.state.indicatorOpacity, {
        duration: duration * 2,
        toValue: 1,
      }),
    ]).start(() => this.refreshIndicator());
  }

  refreshIndicator() {
    this.state.indicatorSize.setValue(0);
    this.state.indicatorOpacity.setValue(0);
  }

  hexToRGBArray = (hex) => hex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));

  rgbArrayToHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

  setAdditiveColor(primaryColorValue, primaryColorName, originalColor) {
    const mergedAdditiveColors = [];
    let i = 0;
    while (i < 3) {
      i === Number(RGB[primaryColorName])
        ? mergedAdditiveColors.push(primaryColorValue)
        : mergedAdditiveColors.push(
          this.state[RGB[i]] !== null
            ? this.state[RGB[i]]
            : originalColor[i],
            );
      i += 1;
    }

    this.setState({
      [primaryColorName]: primaryColorValue,
      localColor: this.rgbArrayToHex(mergedAdditiveColors),
    });
  }

  render() {
    if (!this.state.meId) return null;
    const jiggle = this.state.jiggle.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-5, 5, -5],
    });
    const indicatorOpacity = this.state.indicatorOpacity.interpolate({
      inputRange: [0, 0.45, 0.55, 1],
      outputRange: [0, 1, 1, 0],
    });
    const indicatorOffsetFix = this.state.indicatorSize.interpolate({
      inputRange: [0, 20],
      outputRange: [0, -10],
    });
    const me = this.props.screenProps.usersStatus.find((user: any) => user.id === this.state.meId);

    const hex = this.hexToRGBArray(me.color);

    return (
        <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}>
      <View
      style={{ flex: 1, height: '100%', backgroundColor: 'white' }}>
        <View
        style={{marginTop: TOP_OFFSET, alignSelf: 'center', width: screen.width - 100}}
        >
        <Input
            inputContainerStyle={{ borderBottomWidth: 0 }}
            leftIcon={<Icon name='user' size={24} color='black'/>}
            onChangeText={(localUsername: string) => this.setState({ localUsername })}
            value={this.state.localUsername !== null ? this.state.localUsername : me.username}
            placeholder='your humbleness'
            placeholderTextColor='grey'
            maxLength={40}
          />
          <TouchableOpacity
            activeOpacity={1}
            style={{
            //   marginTop: TOP_OFFSET,
            width: '100%',
              height: 175,
              backgroundColor: `${this.state.localColor ? this.state.localColor : me.color}CC`,
              opacity: 1,
              zIndex: 4,
              alignSelf: 'center',
              borderRadius: 1.5,
            }}
            onPress={(e) => this.move(e)}
          >
            <Animated.View
              pointerEvents={'none'}
              style={{
                flex: 1,
                transform: [{ translateY: jiggle }],
              }}
            >
              <Animated.View
                pointerEvents={'none'}
                style={{
                  transform: [{ translateX: this.state.locationX }, { translateY: this.state.locationY }],
                }}
              >
                <Image
                  style={{
                    width: 75,
                    height: 75,
                    transform: [{ translateX: -75 / 2 }, { translateY: -75 / 2 }],
                  }}
                  source={{
                    uri: `${BACKEND_API}/opt/server/avatars/${
                      this.state.localAvatar ? this.state.localAvatar : me.avatar
                    }.png`,
                  }}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
          <View style={{ width: screen.width - 100, alignSelf: 'center' }}>

          <ColorSliders
            red={this.state.red}
            green={this.state.green}
            blue={this.state.blue}
            originalColor={hex}
            setAdditiveColor={this.setAdditiveColor.bind(this)}
          />

          </View>
        </View>
        <View style={{ height: 35, alignSelf: 'center', flexDirection: 'row', width: screen.width - 100 }}>
            <View style={{ width: '50%', justifyContent: 'flex-start', flexDirection: 'row' }}>
                <TouchableOpacity
                style={{width: '40%'}}
                >
                    <Icon style={{ alignSelf: 'center' }} name='maximize' size={30} />
                    <Text style={{ alignSelf: 'center' }}>avatar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={{width: '40%'}}
                >
                    <Icon style={{ alignSelf: 'center' }} name='cpu' size={30} />
                    <Text style={{ alignSelf: 'center' }}>profile</Text>
                </TouchableOpacity>
            </View>
            <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row' }}>
                <TouchableOpacity
                style={{width: '40%'}}
                >
                <Icon style={{ alignSelf: 'center' }} name='x-square' size={30} />
                <Text style={{ alignSelf: 'center' }}>undo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={{width: '40%'}}
                >
                <Icon style={{ alignSelf: 'center' }} name='save' size={30} />
                <Text style={{ alignSelf: 'center' }}>keep</Text>
                </TouchableOpacity>
            </View>
        </View>
        <Animated.View
          style={{
            transform: [{ translateX: this.state.indicatorX }, { translateY: this.state.indicatorY }],
            position: 'absolute',
          }}
        >
          <Animated.View
            pointerEvents={'none'}
            style={{
              width: this.state.indicatorSize,
              height: this.state.indicatorSize,
              transform: [{ translateX: indicatorOffsetFix }, { translateY: indicatorOffsetFix }],
              opacity: indicatorOpacity,
              borderWidth: 1.5,
              borderColor: '#000',
            }}
          />
        </Animated.View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}
