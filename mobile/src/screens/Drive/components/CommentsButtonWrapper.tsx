import React from 'react';
import { View, Text } from 'react-native';
import { FeatherHeaderButtons, Item } from './headerButton';

export class CommentsButtonWrapper extends React.Component<any, any> {

  componentDidMount() {
    this.props.more();
  }

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <FeatherHeaderButtons>
          <Item
            title='message-circle'
            iconName='message-circle'
            onPress={() =>
              this.props.navigation.navigate('Comments', {
                fileObject: this.props.fileObject,
                comments: this.props.comments,
              })
            }
          />
        </FeatherHeaderButtons>
          <View style={{
            opacity: .7,
            paddingLeft: 2,
            borderBottomLeftRadius: 7,
            backgroundColor: '#ff2d70',
            alignSelf: 'flex-end',
            }}>
            <Text style={{ color: '#fff' }}>
              {this.props.comments.length}
            </Text>
          </View>
      </View>
    );
  }
}
