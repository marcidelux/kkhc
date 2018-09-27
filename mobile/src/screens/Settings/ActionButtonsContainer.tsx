import React from 'react';
import { View, TouchableOpacity, Animated, Text, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const screen = Dimensions.get('window');

export class ActionButtonsContainer extends React.Component<any, any> {
  render() {
    const {
      canSaveWidgetOffset,
      canSaveWidgetScale,
      canSaveWidgetOpacity,
      canSaveWidgetHiglight,
      undo,
      toggleAvatarSelection,
    } = this.props;
    return (
      <View style={styles.outerContainer}>
        <View style={styles.leftContainer}>
          <TouchableOpacity style={{ width: '40%' }} onPress={() => toggleAvatarSelection()}>
            <Icon style={{ alignSelf: 'center' }} name='maximize' size={30} />
            <Text style={{ alignSelf: 'center' }}>avatar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: '40%' }}>
            <Icon style={{ alignSelf: 'center' }} name='cpu' size={30} />
            <Text style={{ alignSelf: 'center' }}>profile</Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.rightContainer,
            {
              transform: [{ translateY: canSaveWidgetOffset }, { scale: canSaveWidgetScale }],
              opacity: canSaveWidgetOpacity,
            },
          ]}>
          <TouchableOpacity style={{ width: '40%' }} onPress={() => undo()}>
            <Animated.Text style={{ color: canSaveWidgetHiglight, alignSelf: 'center' }}>
              <Icon name='x-square' size={30} />
            </Animated.Text>
            <Animated.Text style={{ color: canSaveWidgetHiglight, alignSelf: 'center' }}>undo</Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: '40%' }}>
            <Animated.Text style={{ color: canSaveWidgetHiglight, alignSelf: 'center' }}>
              <Icon name='save' size={30} />
            </Animated.Text>
            <Animated.Text style={{ color: canSaveWidgetHiglight, alignSelf: 'center' }}>keep</Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outerContainer: { height: 45, alignSelf: 'center', flexDirection: 'row', width: screen.width - 100 },
  leftContainer: { width: '50%', justifyContent: 'flex-start', flexDirection: 'row' },
  rightContainer: {
    width: '50%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});