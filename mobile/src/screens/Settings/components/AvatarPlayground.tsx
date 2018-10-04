import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';

const PLAYGROUND_HEIGHT = 175;
const IMAGE_DIMENSION = 75;
export class AvatarPlayground extends React.Component<any, any> {
  render() {
      const {
        localAvatar,
        remoteAvatar,
        moveAvatar,
        localColor,
        remoteColor,
        translateX,
        translateY,
        jiggle,
      } = this.props;

    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.avatarPlayground,
            { backgroundColor: `${localColor
                ? localColor
                : remoteColor}CC` },
          ]}
          onPress={(e) => moveAvatar(e)}>
          <Animated.View
            pointerEvents={'none'}
            style={{
              flex: 1,
              transform: [{ translateY: jiggle }],
            }}>
            <Animated.View
              pointerEvents={'none'}
              style={{
                transform: [{ translateX }, { translateY }],
              }}>
              <Image
                style={styles.avatar}
                source={{
                  uri: `${BACKEND_API}/opt/server/avatars/${
                    localAvatar
                    ? localAvatar
                    : remoteAvatar
                  }.png`,
                }}/>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatarPlayground: {
    width: '100%',
    height: PLAYGROUND_HEIGHT,
    opacity: 1,
    zIndex: 4,
    alignSelf: 'center',
    borderRadius: 1.5,
  },
  avatar: {
    width: IMAGE_DIMENSION,
    height: IMAGE_DIMENSION,
    transform: [
        { translateX: -IMAGE_DIMENSION / 2 },
        { translateY: -IMAGE_DIMENSION / 2 },
    ]},
});