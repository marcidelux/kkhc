import React from 'react';
import { View, TouchableOpacity, Animated, Text, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const screen = Dimensions.get('window');

export class ActionButtons extends React.Component<any, any> {
  render() {
    const {
      canSaveWidgetOffset,
      canSaveWidgetScale,
      canSaveWidgetOpacity,
      canSaveWidgetHiglight,
      undo,
      save,
      toggleAvatarSelection,
      toggleSystemSettingsModal,
    } = this.props;
    return (
      <View style={styles.outerContainer}>
        <View style={styles.leftContainer}>
          <TouchableOpacity style={styles.button} onPress={() => toggleAvatarSelection()}>
            <Icon style={styles.buttonContent} name='maximize' size={30} />
            <Text style={styles.buttonContent}>avatar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => toggleSystemSettingsModal()}>
            <Icon style={styles.buttonContent} name='cpu' size={30} />
            <Text style={styles.buttonContent}>profile</Text>
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
          <TouchableOpacity style={styles.button} onPress={() => undo()}>
            <Animated.Text style={[{ color: canSaveWidgetHiglight }, styles.buttonContent]}>
              <Icon name='x-square' size={30} />
            </Animated.Text>
            <Animated.Text style={[{ color: canSaveWidgetHiglight }, styles.buttonContent]}>undo</Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => save()}>
            <Animated.Text style={[{ color: canSaveWidgetHiglight }, styles.buttonContent]}>
              <Icon name='save' size={30} />
            </Animated.Text>
            <Animated.Text style={[{ color: canSaveWidgetHiglight }, styles.buttonContent]}>keep</Animated.Text>
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
  button: { width: '40%' },
  buttonContent: { alignSelf: 'center' },
});