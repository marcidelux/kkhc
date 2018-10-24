import { Text, View } from 'react-native';
import React from 'react';
import { Avatar } from 'react-native-elements';
import { BACKEND_API } from 'react-native-dotenv';

declare type TagPrimitive = {
    userId: string,
    name: string,
};

export default class Tags extends React.Component<any, any> {
  componentDidMount() {
    this.props.more();
  }

  renderTags() {
    if (this.props.tags.length === 0) return null;
    console.log(this.props.tags);
    return this.props.tags.map((tagPrimitive: TagPrimitive, i: number) => (
      <View key={i}>
        <Text style={{ color: this.props.userStatus[tagPrimitive.userId].color }}>
          {tagPrimitive.name}
        </Text>
      </View>
    ));
  }
    render() {
      if (!this.props.tags) return null;
      return (
        <View>
          {this.renderTags()}
        </View>
      );
    }
}