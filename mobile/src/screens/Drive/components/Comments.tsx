import { Text, View } from 'react-native';
import React from 'react';
import { Avatar } from 'react-native-elements';
import { BACKEND_API } from 'react-native-dotenv';

export default class Comments extends React.Component<any, any> {
  componentDidMount() {
    this.props.more();
  }

  renderComments() {
    if (this.props.comments.length === 0) return null;
    console.log(this.props.comments)
    console.log(this.props.userStatus)
    return this.props.comments.map(comment => (
      <View>
        <Avatar
        avatarStyle={{opacity: .7, transform: [{scale: .9}] }}
        source={{uri: `${BACKEND_API}/opt/server/avatars/${this.props.userStatus[comment.userId].avatar}.png` }}
        size={'small'}
        rounded
        containerStyle={{backgroundColor: this.props.userStatus[comment.userId].color }}
        />
        <Text key={comment.id}>
        {this.props.userStatus[comment.userId].username} | {comment.text} | {comment.date}
        </Text>
      </View>
    ));
  }
    render() {
      if (!this.props.comments) return null;
      return (
        <View>
          {this.renderComments()}
        </View>
      );
    }
}