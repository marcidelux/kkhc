import { Text, View, Animated, LayoutAnimation, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import { Avatar } from 'react-native-elements';
import { BACKEND_API } from 'react-native-dotenv';
import R from 'ramda';
import autobind from 'autobind-decorator';
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
      // why is this working at all
      // change to selected name |> tagPRimitve as key and state selecetion
      // if (Number.isInteger(this.state.selected))
      this.setState({
        selected: this.state.selected + 1,
      });
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

  _handleSelection(index: number, e) {
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
      selected: index,
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
    return this.props.tags.map((tagPrimitive: TagPrimitive, i: number) => {
      const handleSelection = this._handleSelection.bind(this, i);
      return (
        <TouchableOpacity
          onPress={handleSelection}
          key={tagPrimitive.name}
          style={{}}
        >
        <View style={{
          ...(this.state.selected === i
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
          height: this.state.selected === i
          ? this.state.scaleValue.interpolate({
            inputRange: [1, 1.1],
            outputRange: [34, 60],
          })
          : 34,
          transform: this.state.selected === i
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

  _renderItem = ({item: tagPrimitive}, i) => {
    const handleSelection = this._handleSelection.bind(this, i);
      return (
        <TouchableOpacity
          onPress={handleSelection}
          key={tagPrimitive.name}
          style={{}}
        >
        <View style={{
          ...(this.state.selected === i
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
          height: this.state.selected === i
          ? this.state.scaleValue.interpolate({
            inputRange: [1, 1.1],
            outputRange: [34, 60],
          })
          : 34,
          transform: this.state.selected === i
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
  }

  _keyExtractor = (item, index) => item.name;

  render() {
    if (!this.props.tags || !this.props.imageLoaded) return null;
    return (
      <View
        style={{
          flex: 1,
          flexWrap: 'wrap',
          flexDirection: 'row',
          padding: 10,
          alignItems: 'center',
        }}
      >
        {this.renderTags()}
        {/* <FlatList
        keyExtractor={this._keyExtractor}
        data={this.props.tags}
        renderItem={this._renderItem}
        /> */}
      </View>
    );
  }
}
