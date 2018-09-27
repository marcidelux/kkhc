import React from 'react';
import {
  Animated,
} from 'react-native';

export class Indicator extends React.Component<any, any> {
    render() {
        const {
            translateX,
            translateY,
            size,
            offsetFix,
            opacity,
        } = this.props;
        return (
            <Animated.View
            style={{
              transform: [
                { translateX },
                { translateY },
              ],
              position: 'absolute',
            }}>
            <Animated.View
              pointerEvents={'none'}
              style={{
                width: size,
                height: size,
                transform: [
                    { translateX: offsetFix },
                    { translateY: offsetFix },
                ],
                opacity: opacity,
                borderWidth: 1.5,
                borderColor: '#000',
              }}/>
          </Animated.View>
        );
    }
}
