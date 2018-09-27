import React from 'react';
import {
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import { when } from 'mobx';
import { AvatarPlayground } from './AvatarPlayground';
import { ColorSliders } from './ColorSliders';
import { Indicator } from './Indicator';
import SettingsStore from './settingsStore';
import { AvatarSelector } from './AvatarSelector';
import { ActionButtonsContainer } from './ActionButtonsContainer';

enum RGB {
  red,
  green,
  blue,
}

declare type color = 'red' | 'green' | 'blue';

const screen = Dimensions.get('window');
const TOP_OFFSET = 30;
const INDICATOR_SIZE = 40;
const PLAYGROUND_HEIGHT = 175;

@observer
export class SettingsScreen extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      store: new SettingsStore(),
      toggleAvatarSelection: false,
      AvatarSelectorAnimationValue: new Animated.Value(0),
      canSaveWidgetInAnimationValue: new Animated.Value(0),
      canSaveWidgetOutAnimationValue: new Animated.Value(1),
      canSaveWidgetHiglight: new Animated.Value(0),
      locationX: new Animated.Value((screen.width - 100) / 2),
      locationY: new Animated.Value(50),
      jiggle: new Animated.Value(0),
      indicatorX: 0,
      indicatorY: 0,
      indicatorSize: new Animated.Value(0),
      indicatorOpacity: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    this.props.screenProps.subscribeToUsersStatus();
    this.jiggle();
    this.higlight();
  }

  higlight() {
    Animated.loop(
      Animated.timing(this.state.canSaveWidgetHiglight, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.5, 0.43, 0.47, 0.61),
      }),
    ).start();
  }

  revealCanSaveWidget() {
    Animated.parallel([
      Animated.timing(this.state.canSaveWidgetOutAnimationValue, {
        toValue: 1,
        duration: 10,
        easing: Easing.bounce,
      }),
      Animated.timing(this.state.canSaveWidgetInAnimationValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.bounce,
      }),
    ]).start();
  }

  undo() {
    this.state.store.revertBackToInitialState();
    this.hideCanSaveWidget();
  }

  hideCanSaveWidget() {
    Animated.sequence([
      Animated.timing(this.state.canSaveWidgetOutAnimationValue, {
        toValue: 0,
        duration: 250,
        easing: Easing.linear,
      }),
      ...this.refreshCanSaveWidget(),
    ]).start();
  }

  refreshCanSaveWidget() {
    return [
      Animated.timing(this.state.canSaveWidgetInAnimationValue, {
        toValue: 0,
        duration: 10,
      }),
      Animated.timing(this.state.canSaveWidgetOutAnimationValue, {
        toValue: 1,
        duration: 10,
      }),
    ];
  }

  toggleAvatarSelection(): void {
    if (!this.state.toggleAvatarSelection) {
      Animated.timing(this.state.AvatarSelectorAnimationValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.09, .83, .19, .94),
      }).start();
    } else {
      Animated.timing(this.state.AvatarSelectorAnimationValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.09, .83, .19, .94),
      }).start();
    }
    this.setState({
      toggleAvatarSelection: !this.state.toggleAvatarSelection,
    });
  }

  changeAvatar(newAvatar: String): void {
    this.state.store.localAvatar = newAvatar;
  }

  jiggle(): void {
    Animated.loop(
      Animated.timing(this.state.jiggle, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.43, 0.47, 0.61),
      }),
    ).start();
  }

  moveAvatar(e: any): void {
    if (this.restrictAvatarMovement(e)) {
      return;
    }
    this.refreshIndicator();
    const {
      locationX,
      locationY,
      pageX,
      pageY,
    } = e.nativeEvent;

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

  restrictAvatarMovement(e: any): Boolean {
    const {
      locationX,
      locationY,
    } = e.nativeEvent;
    return (
      locationX < 0 ||
      locationX > screen.width - 100 ||
      locationY < 0 ||
      locationY > PLAYGROUND_HEIGHT
    );
  }

  refreshIndicator(): void {
    this.state.indicatorSize.setValue(0);
    this.state.indicatorOpacity.setValue(0);
  }

  hexToRGBArray(hex: string): Array<number> {
    return hex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
  }

  rgbArrayToHex(rgb: Array<number>): string {
    return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  setAdditiveColor(primaryColorValue: number, primaryColorName: color, originalColor: Array<number>): void {
    const mergedAdditiveColors = [];
    let i = 0;
    while (i < 3) {
      i === Number(RGB[primaryColorName])
        ? mergedAdditiveColors.push(primaryColorValue)
        : mergedAdditiveColors.push(this.state.store[RGB[i]] !== null ? this.state.store[RGB[i]] : originalColor[i]);
      i += 1;
    }

    this.state.store[primaryColorName] = primaryColorValue;
    this.state.store.localColor = this.rgbArrayToHex(mergedAdditiveColors);
  }

  render() {
    this.state.store.getLoggedInUserId(this.props.screenProps.usersStatus);
    if (!this.state.store.meId) return null;
    const jiggle = this.state.jiggle.interpolate({
      inputRange: [0, .5, 1],
      outputRange: [-5, 5, -5],
    });
    const indicatorOpacity = this.state.indicatorOpacity.interpolate({
      inputRange: [0, .45, .55, 1],
      outputRange: [0, 1, 1, 0],
    });
    const indicatorOffsetFix = this.state.indicatorSize.interpolate({
      inputRange: [0, INDICATOR_SIZE],
      outputRange: [0, -INDICATOR_SIZE / 2],
    });
    const avatarSelectorOffset = this.state.AvatarSelectorAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-screen.width, 0],
    });
    const avatarSelectorOpacity = this.state.AvatarSelectorAnimationValue.interpolate({
      inputRange: [0, .7, 1],
      outputRange: [0, .3, 1],
    });

    when(
      () => this.state.store.canSave,
      () => {
        this.revealCanSaveWidget();
      },
    );

    when(
      () => (this.state.store.meId && this.state.store.canSave && this.state.store.remoteAndLocalEquality),
      () => {
        this.hideCanSaveWidget();
      },
    );

    const canSaveWidgetOpacity = this.state.canSaveWidgetInAnimationValue.interpolate({
      inputRange: [0, .5, 1],
      outputRange: [0, .7, 1],
    });
    const canSaveWidgetOffset = this.state.canSaveWidgetInAnimationValue.interpolate({
      inputRange: [0, .5, 1],
      outputRange: [-45, -15, 0],
    });
    const canSaveWidgetScale = this.state.canSaveWidgetOutAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const canSaveWidgetHiglight = this.state.canSaveWidgetHiglight.interpolate({
      inputRange: [0, .5, 1],
      outputRange: ['#5c63d8', '#b2b0b0', '#e80c7a'],
    });

    const { remoteAvatar, remoteColor, remoteUsername } = this.state.store;

    const originalColor = this.hexToRGBArray(remoteColor);
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.main}>
          <View style={styles.mainTop}>
            <Input
              inputContainerStyle={{ borderBottomWidth: 0 }}
              leftIcon={<Icon name='user' size={24} color='black' />}
              onChangeText={(u: string) => this.state.store.localUsername = u}
              value={this.state.store.localUsername !== null ? this.state.store.localUsername : remoteUsername}
              placeholder='your humbleness'
              placeholderTextColor='grey'
              maxLength={40}
            />

            <AvatarPlayground
              localAvatar={this.state.store.localAvatar}
              remoteAvatar={remoteAvatar}
              moveAvatar={this.moveAvatar.bind(this)}
              localColor={this.state.store.localColor}
              remoteColor={remoteColor}
              translateX={this.state.locationX}
              translateY={this.state.locationY}
              jiggle={jiggle}
            />

            <ColorSliders
              red={this.state.store.red}
              green={this.state.store.green}
              blue={this.state.store.blue}
              originalColor={originalColor}
              setAdditiveColor={this.setAdditiveColor.bind(this)}
            />

            <ActionButtonsContainer
              toggleAvatarSelection={this.toggleAvatarSelection.bind(this)}
              undo={this.undo.bind(this)}
              canSaveWidgetOffset={canSaveWidgetOffset}
              canSaveWidgetScale={canSaveWidgetScale}
              canSaveWidgetOpacity={canSaveWidgetOpacity}
              canSaveWidgetHiglight={canSaveWidgetHiglight}
            />
          </View>


          <AvatarSelector
            changeAvatar={this.changeAvatar.bind(this)}
            offset={avatarSelectorOffset}
            opacity={avatarSelectorOpacity}
          />

          <Indicator
            translateX={this.state.indicatorX}
            translateY={this.state.indicatorY}
            size={this.state.indicatorSize}
            offsetFix={indicatorOffsetFix}
            opacity={indicatorOpacity}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  main: { flex: 1, height: '100%', backgroundColor: 'white' },
  mainTop: { marginTop: TOP_OFFSET, alignSelf: 'center', width: screen.width - 100 },
});
