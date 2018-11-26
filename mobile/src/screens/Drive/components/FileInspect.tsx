import React from 'react';
import { Text, TouchableOpacity, View, Dimensions, ScrollView, TextInput, StyleSheet, Animated } from 'react-native';
import Image from 'react-native-scalable-image';
import { BACKEND_API } from 'react-native-dotenv';
import Comments from './Comments';
import { NavigationComponent } from 'react-navigation';
import { observer, renderReporter } from 'mobx-react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Tags from './Tags';
import Icon from 'react-native-vector-icons/Feather';
import autobind from 'autobind-decorator';

import CONSTANTS from './../../../constants';

const GET_COMMENTFLOW = gql`
  query getCommentFlow($fileHash: String!) {
    getCommentFlow(fileHash: $fileHash) {
      comments {
        text
        userId
        date
        id
      }
      belongsTo
    }
  }
`;

const GET_TAGFLOW = gql`
  query getTagFlow($fileHash: String!) {
    getTagFlow(fileHash: $fileHash) {
      tagPrimitives {
        name
        userId
      }
      belongsTo
    }
  }
`;

const COMMENTFLOW_SUBSCRIPTION = gql`
  subscription newCommentAddedToFile($fileHash: String!) {
    newCommentAddedToFile(fileHash: $fileHash) {
      text
      userId
      id
      date
    }
  }
`;

const TAGFLOW_SUBSCRIPTION = gql`
  subscription newTagsAddedToFile($fileHash: String!) {
    newTagsAddedToFile(fileHash: $fileHash) {
      name
      userId
    }
  }
`;

const width = Dimensions.get('window').width;

export class FileInspect extends React.Component<
  any,
  {
    text: string;
    realImageOpacity: any;
    placeholderImageOpacity: any;
    imageLoaded: boolean,
  }
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationComponent }) => ({
    title: navigation.state.params.fileObject.name,
  })

  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
      realImageOpacity: new Animated.Value(0),
      placeholderImageOpacity: new Animated.Value(0),
      imageLoaded: false,
    };
  }

  tagFlowWrapper(fileObject: any, userDisplayProperties: any) {
    return (
      <Query fetchPolicy={'network-only'} query={GET_TAGFLOW} variables={{ fileHash: fileObject.hash }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;
          console.log(data.getTagFlow.tagPrimitives.length)

          const subscribeToMoreTags = () => subscribeToMore(this.moreTagsHandler(fileObject));
          return (
            <Tags
            imageLoaded={this.state.imageLoaded}
            userStatus={userDisplayProperties}
            tags={data.getTagFlow.tagPrimitives}
            more={subscribeToMoreTags} />
          );
        }}
      </Query>
    );
  }

  moreTagsHandler(fileObject: any) {
    return {
      document: TAGFLOW_SUBSCRIPTION,
      variables: { fileHash: fileObject.hash },
      updateQuery: (previous, { subscriptionData }) => {
        if (!subscriptionData.data) return previous;
        const { newTagsAddedToFile } = subscriptionData.data;
        return Object.assign({}, previous, {
          getTagFlow: {
            ...previous.getTagFlow,
            tagPrimitives: [...newTagsAddedToFile, ...previous.getTagFlow.tagPrimitives],
          },
        });
      },
    };
  }

  commentFlowWrapper(fileObject: any, userDisplayProperties: any) {
    return (
      <Query query={GET_COMMENTFLOW} variables={{ fileHash: fileObject.hash }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;

          const subscribeToMoreComments = () => subscribeToMore(this.moreCommentsHandler(fileObject));
          return (
            <Comments
              userStatus={userDisplayProperties}
              comments={data.getCommentFlow.comments}
              more={subscribeToMoreComments}
            />
          );
        }}
      </Query>
    );
  }

  moreCommentsHandler(fileObject: any) {
    return {
      document: COMMENTFLOW_SUBSCRIPTION,
      variables: { fileHash: fileObject.hash },
      updateQuery: (previous, { subscriptionData }) => {
        if (!subscriptionData.data) return previous;
        const { newCommentAddedToFile } = subscriptionData.data;
        return Object.assign({}, previous, {
          getCommentFlow: {
            ...previous.getCommentFlow,
            comments: [...previous.getCommentFlow.comments, newCommentAddedToFile],
          },
        });
      },
    };
  }

  @autobind
  _realImageOnload() {
    Animated.spring(this.state.realImageOpacity, {
      toValue: 1,
    }).start();
    this.setState({
      imageLoaded: true,
    });
  }

  @autobind
  _placeholderImageOnload() {
    Animated.spring(this.state.placeholderImageOpacity, {
      toValue: 1,
    }).start();
  }

  // renderTags = () => this.props.navigation.state.params.fileObject.tags.length > 0
  //     ? this.props.navigation.state.params.fileObject.tags.map((tag: {}, index: number) => (
  //         <Text key={index}>{tag}</Text>
  //       ))
  //     : null

  render() {
    const fileObject = this.props.navigation.state.params.fileObject;
    const userDisplayProperties = this.props.screenProps.usersStatus.reduce((accumulator, { id, ...rest }) => {
      accumulator[id] = rest;
      return accumulator;
    }, {});

    const pathToFile = fileObject.sizeInMb >= 0.5
        ? [CONSTANTS.PATH_TO_DRIVE, CONSTANTS.COMPRESSED_FOLDER, fileObject.hash].join('/') + '.png'
        : fileObject.path;

      const pathToThumb = [CONSTANTS.PATH_TO_DRIVE, CONSTANTS.THUMB_FOLDER, fileObject.hash].join('/') + '.png';

    console.log(fileObject.sizeInMb);

    const renderProportion = fileObject.width / width;

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          style={{ width: '100%', height: Dimensions.get('window').height }}
          contentContainerStyle={{
            paddingBottom: 50,
            // flexDirection: 'row',
            // flexWrap: 'wrap',
          }}
        >
          <View width={width} height={fileObject.height / renderProportion}>
            <Animated.View style={{ opacity: this.state.placeholderImageOpacity }}>
              <Image
                width={width}
                style={{ position: 'absolute' }}
                blurRadius={1}
                // height={fileObject.height / renderProportion}
                source={{ uri: BACKEND_API + pathToThumb }}
                onLoad={this._placeholderImageOnload}
              />
            </Animated.View>
            <Animated.View style={{ opacity: this.state.realImageOpacity }}>
              <Image
                width={width}
                // height={fileObject.height / renderProportion}
                source={{ uri: BACKEND_API + pathToFile }}
                onLoad={this._realImageOnload}
              />
            </Animated.View>
          </View>
          <View style={{ backgroundColor: 'blue', width, flex: 1, alignItems: 'flex-end' }}>
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'purple', width: 100, justifyContent: 'space-around' }}>
              <TouchableOpacity>
                <Icon name='hash' size={25} color='black' />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name='message-circle' size={25} color='black' />
              </TouchableOpacity>
            </View>
          </View>
          {this.tagFlowWrapper(fileObject, userDisplayProperties)}
          {this.commentFlowWrapper(fileObject, userDisplayProperties)}
          {/* <TouchableOpacity
            // onPress={() => this.state.text === ''
            // ? null
            // : this.store.addComment(fileObject.hash, this.state.text)}
            style={{ backgroundColor: 'red' }}
          >
            <Text style={{ marginBottom: 50 }}>Sub ur Comment</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={(text) => this.setState({ text })}
              value={this.state.text}
              // onSubmitEditing={this.addComment}
              placeholder="Have a Comment!"
              placeholderTextColor="grey"
              multiline={true}
              maxLength={250}
            />
          </TouchableOpacity> */}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
