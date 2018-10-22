import { Text, View } from 'react-native';
import React from 'react';

export default class Comments extends React.Component<any, any> {
  componentDidMount() {
    this.props.more();
  }

  renderComment() {
    console.log(this.props.comments)
    if (this.props.comments.length === 0) return null;
    return this.props.comments.map(comment => (
      <Text key={comment.id}>
          {comment.userId} | {comment.text} | {comment.date}
        </Text>
    ));
  }
    render() {
      if (!this.props.comments) return null;
      return (
        <View>
          {this.renderComment()}
        </View>
      );
    }
}