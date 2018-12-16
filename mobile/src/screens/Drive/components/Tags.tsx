import {
  Text,
  View,
  Animated,
  LayoutAnimation,
  TouchableOpacity,
  TouchableWithoutFeedback,
 } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';

declare type TagPrimitive = {
  userId: string;
  name: string;
};

export default class Tags extends React.Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      scaleValue: new Animated.Value(1),
      translateY: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.props.more();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tags.length < this.props.tags.length) {
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
    }
  }

  _handleSelection(name: number) {
  Animated.parallel([
    Animated.timing(this.state.scaleValue, {
      toValue: 1,
      duration: 100,
    }),
    Animated.timing(this.state.translateY, {
      toValue: 0,
      duration: 100,
    }),
  ]).start(() => {
    this.setState({
      selected: name,
    },
    () => Animated.parallel([
      Animated.timing(this.state.scaleValue, {
        toValue: 1.1,
        duration: 500,
      }),
      Animated.timing(this.state.translateY, {
        toValue: -30,
        duration: 500,
      }),
    ]).start());
  });
  }

  renderTags() {
    if (this.props.tags.length === 0) return null;
    return this.props.tags.map((tagPrimitive: TagPrimitive) => {
      const handleSelection = this._handleSelection.bind(this, tagPrimitive.name);
      return (
        <TouchableOpacity
          onPress={handleSelection}
          key={tagPrimitive.name}
          style={{}}
        >
        <View style={{
          ...(this.state.selected === tagPrimitive.name
            ? {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
             },
              shadowOpacity: 0.30,
              shadowRadius: 4.65,
              elevation: 8,
            }
            : {}),
        }}>
        <Animated.View style={{
          overflow: 'hidden',
          margin: 5,
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: this.props.userStatus[tagPrimitive.userId].color,
          borderRadius: 20,
          height: this.state.selected === tagPrimitive.name
          ? this.state.scaleValue.interpolate({
            inputRange: [1, 1.1],
            outputRange: [34, 60],
          })
          : 34,
          transform: this.state.selected === tagPrimitive.name
              ? [{ scale: this.state.scaleValue }, { translateY: this.state.translateY }]
              : [],
              }}>
          <Text style={{ fontSize: 20 }}># {tagPrimitive.name}</Text>
          <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <TouchableOpacity>
              <Icon
                style={}
                name='trash'
                size={20}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                style={}
                name='zap'
                size={20}
              />
            </TouchableOpacity>
          </View>
          </Animated.View>
          </View>
        </TouchableOpacity>
      );
    });
  }

  render() {
    if (!this.props.tags || !this.props.imageLoaded) return null;
    return (
      <TouchableWithoutFeedback
        onPress={() => this._handleSelection(null)}>
        <View
          style={{
            flex: 1,
            flexWrap: 'wrap',
            flexDirection: 'row',
            marginTop: 15,
            padding: 10,
            alignItems: 'center',
          }}>
          {this.renderTags()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
