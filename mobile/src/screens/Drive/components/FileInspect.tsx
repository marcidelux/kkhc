import React from 'react';
import { Text, Keyboard, TouchableOpacity, View, Dimensions, ScrollView, TextInput, StyleSheet, Animated, findNodeHandle } from 'react-native';
import Image from 'react-native-scalable-image';
import { BACKEND_API } from 'react-native-dotenv';
import Comments from './Comments';
import { NavigationComponent } from 'react-navigation';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Tags from './Tags';
import Icon from 'react-native-vector-icons/Feather';
import autobind from 'autobind-decorator';
import { Input } from 'react-native-elements';
import Lightbox from 'react-native-lightbox';

import CONSTANTS from './../../../constants';

const screen = Dimensions.get('window');

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
    keyboardWillShowSub: any,
    realImageOpacity: any;
    placeholderImageOpacity: any;
    imageLoaded: boolean,
  }
> {
  private keyboardHeight: number;
  private imageHeight: number;
  private outerScrollViewReference: any;
  private lightboxScrollResponderReference: any;

  static navigationOptions = ({ navigation }: { navigation: NavigationComponent }) => ({
    title: navigation.state.params.fileObject.name,
  })

  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
      keyboardWillShowSub: Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this)),
      realImageOpacity: new Animated.Value(0),
      placeholderImageOpacity: new Animated.Value(0),
      imageLoaded: false,
    };
  }

  keyboardWillShow(e) {
    this.keyboardHeight = e.endCoordinates.screenY;
    this._handleFocus();
  }

  componentWillUnmount() {
    this.state.keyboardWillShowSub.remove();
  }

  tagFlowWrapper(fileObject: any, userDisplayProperties: any) {
    return (
      <Query fetchPolicy={'network-only'} query={GET_TAGFLOW} variables={{ fileHash: fileObject.hash }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;
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
    Animated.sequence([
      Animated.spring(this.state.realImageOpacity, {
        toValue: 1,
      }),
      Animated.spring(this.state.placeholderImageOpacity, {
        toValue: 0,
      }),
    ]).start();
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

  @autobind
  setOuterScrollViewReference(node) {
    if (node) {
      this.outerScrollViewReference = node.getScrollResponder();
    }
  }

  @autobind
  _handleFocus() {
    const headerHeight = 64;
    const screenWithoutHeader = screen.height - headerHeight;
    const topLeftOver = screenWithoutHeader - this.keyboardHeight;
    const y = this.imageHeight - topLeftOver;
    this.outerScrollViewReference.scrollTo({x: 0, y, animated: true});
  }

  @autobind
  setZoomReference(node) {
    if (node) {
      this.lightboxScrollResponderReference = node.getScrollResponder();
    }
  }

  handleResetZoomScale = (width) => {
    this.lightboxScrollResponderReference.scrollResponderZoomTo({
       x: 0,
       y: 0,
       width,
       height: 1,
       animated: true,
    });
  }

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

    const renderProportion = fileObject.width / width;

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          ref={this.setOuterScrollViewReference}
          keyboardDismissMode='interactive'
          style={{ width: '100%', height: Dimensions.get('window').height }}
          contentContainerStyle={{
            paddingBottom: 50,
          }}>
          <View
            width={width}
            height={fileObject.height / renderProportion}>
            <Animated.View style={{ opacity: this.state.placeholderImageOpacity }}>
              <Image
                width={width}
                style={{ position: 'absolute' }}
                source={{ uri: BACKEND_API + pathToThumb }}
                onLoad={this._placeholderImageOnload}
              />
            </Animated.View>
            <Animated.View
              onLayout={(event) => {
                if (event.nativeEvent.layout.height) {
                  this.imageHeight = event.nativeEvent.layout.height;
                }
              }}
              style={{ opacity: this.state.realImageOpacity }}>
              <Lightbox
                swipeToDismiss={false}
                willClose={() => this.handleResetZoomScale(width) }>
                <ScrollView
                  ref={this.setZoomReference}
                  minimumZoomScale={1}
                  maximumZoomScale={2}
                  centerContent>
                  <Image
                    width={width}
                    source={{ uri: BACKEND_API + pathToFile, cache: 'force-cache' }}
                    onLoad={this._realImageOnload}
                  />
                </ScrollView>
              </Lightbox>
            </Animated.View>
          </View>
          <View style={{ backgroundColor: 'blue', width, flex: 1, alignItems: 'flex-end' }}>
            <View
            style={{ flex: 1, flexDirection: 'row', backgroundColor: 'purple', justifyContent: 'space-around' }}>
              {/* <TouchableOpacity> */}
                <Input
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={<TouchableOpacity><Icon name='hash' size={25} color='black' /></TouchableOpacity>}
                  onChangeText={(text) => this.setState({ text })}
                  value={this.state.text}
                  placeholder='have a tag'
                  placeholderTextColor='grey'
                  maxLength={40}
                />
              {/* </TouchableOpacity> */}
              <TouchableOpacity>
                <Icon name='message-circle' size={25} color='black' />
              </TouchableOpacity>
            </View>
          </View>
          {this.tagFlowWrapper(fileObject, userDisplayProperties)}
          {/* {this.commentFlowWrapper(fileObject, userDisplayProperties)} */}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
