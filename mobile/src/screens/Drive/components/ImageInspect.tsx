import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import Image from 'react-native-scalable-image';
import { BACKEND_API } from 'react-native-dotenv';
import Comments from './Comments';

export class ImageInspect extends React.Component<any, {
  comments: Array<object>,
  text: string}> {

  constructor(props: any) {
    super(props);
    this.state = {
      comments: [...this.props.navigation.state.params.comments],
      text: '',
    };
  }

  async addComment(hash: number, text: string): Promise<void> {
    try {
      const response = await fetch(
        `${BACKEND_API}/addToCommentFlow/${hash}`,
        {
          method: 'POST',
          body: JSON.stringify({
            text,
            user: 'aargon',
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      );
      const { comments } = await response.json();
      this.setState({ comments });
    } catch (error) {
      console.error(error);
    }
  }

  renderTags = () => this.props.navigation.state.params.imageObject.tags.length > 0
      ? this.props.navigation.state.params.imageObject.tags.map((tag: {}, index: number) => (
          <Text key={index}>{tag}</Text>
        ))
      : null

  render() {
    const imageObject = this.props.navigation.state.params.imageObject;
    return (
      <View style={{ flex: 0.2, position: 'absolute' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          style={{ width: '100%', height: Dimensions.get('window').height }}
          contentContainerStyle={{
            paddingBottom: 50,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          <Image
            width={Dimensions.get('window').width}
            source={{
              uri: `${BACKEND_API}${imageObject.path}`,
            }}
          />
          {/* {this.renderTags()} */}
          <Comments comments={this.state.comments}/>
          <TouchableOpacity
            onPress={() => this.state.text === ''
            ? null
            : this.addComment(imageObject.hash, this.state.text)}
            style={{ backgroundColor: 'red' }}>
            <Text style={{ marginBottom: 50 }}>Sub ur Comment</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => this.setState({ text })}
              value={this.state.text}
              // onSubmitEditing={this.addComment}
              placeholder='Have a Comment!'
              placeholderTextColor='grey'
              multiline={true}
              maxLength={250}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
      </View>
    );
  }
}
