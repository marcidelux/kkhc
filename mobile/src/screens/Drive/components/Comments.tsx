import {
  Text,
  View,
  ScrollView,
  LayoutAnimation,
  Animated,
  Keyboard,
  Easing,
  AsyncStorage,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { Avatar, Input } from 'react-native-elements';
import { BACKEND_API } from 'react-native-dotenv';
import CONSTANTS from './../../../constants';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';
import Icon from 'react-native-vector-icons/Feather';
import client from './../../../client';
import autobind from 'autobind-decorator';

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

const UPDATECOMMENTFLOW_MUTATION = gql`
mutation($fileHash: String!, $comment: CommentInput!) {
  updateCommentFlow(fileHash: $fileHash, comment: $comment) {
    comments {
      userId,
      text,
      id,
      date,
    }
    belongsTo
  }
}`;

// @todo should have a mobx store, and on mount load comments, n subscribe to more
export class Comments extends React.Component<any, any> {
  private _scrollView: ScrollView;
  private _input: Input;

  constructor(props) {
    super(props);
    this.state = {
      extraComments: [],
      keyboardWillShowSub: Keyboard.addListener('keyboardWillShow', this.keyboardWillShow),
      keyboardWillHideSub: Keyboard.addListener('keyboardWillHide', this.keyboardWillHide),
      translateY: new Animated.Value(0),
      bottomTabNavigatorHeight: 54,
      commentText: '',
      sending: false,
    };
  }

  keyboardWillShow = (event: any) => {
    Animated.timing(this.state.translateY, {
      duration: event.duration,
      toValue: -event.endCoordinates.height + this.state.bottomTabNavigatorHeight,
      easing: Easing.inOut(Easing.quad),
    }).start();
  }

  keyboardWillHide = (event: { duration: number }) => {
    Animated.timing(this.state.translateY, {
      duration: event.duration,
      toValue: 0,
      easing: Easing.sin,
    }).start();
  }

  componentWillUnmount() {
    this.state.keyboardWillShowSub.remove();
    this.state.keyboardWillHideSub.remove();
  }

  componentDidMount() {
    this.props.screenProps.subscribeToUsersStatus();
  }

  componentDidUpdate() {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
  }

  @autobind
  async sendNewComment() {
    // @todo calls really slow
    if (this.state.commentText && !this.state.sending) {
      this.setState({
        sending: true,
      });
      await client.mutate({
        mutation: UPDATECOMMENTFLOW_MUTATION,
        variables: {
          fileHash: this.props.navigation.state.params.fileObject.hash,
          comment: {
            text: this.state.commentText,
            userId: await AsyncStorage.getItem('loggedInUserId'),
          },
        },
      });
      this.setState({
        sending: false,
        commentText: '',
      });
      this._input.blur();
      this._scrollView.scrollToEnd();
    }
  }

  renderComments(comments) {
    if (comments.length === 0) return null;
    const userDisplayProperties = this.props.screenProps.usersStatus.reduce((accumulator, { id, ...rest }) => {
      accumulator[id] = rest;
      return accumulator;
    }, {});
    return comments.map((comment) => (
      <View
       style={styles.commentWrapper}
       key={comment.id}>
        <Avatar
          avatarStyle={{opacity: .9 }}
          source={{uri: `${BACKEND_API + CONSTANTS.PATH_TO_AVATARS}/${userDisplayProperties[comment.userId].avatar}.png` }}
          size={'small'}
          rounded
          containerStyle={{backgroundColor: userDisplayProperties[comment.userId].color }}/>
        <View style={styles.comment}>
          <Text style={styles.userName}>
            {userDisplayProperties[comment.userId].username}
          </Text>
          <Text>
            {comment.text}
          </Text>
          <Text style={{ color: 'grey' }}>
            {comment.date}
          </Text>
        </View>
      </View>
    ));
  }

  render() {
    return (
      <View style={styles.main}>
        <ScrollView
          ref={node => this._scrollView = node}
          style={{ width: '100%'}}
          contentContainerStyle={{ marginHorizontal: 15, marginTop: 15, paddingBottom: 100 }}>
          {this.renderComments(this.props.navigation.state.params.comments)}
          {this.renderComments(this.state.extraComments)}
          <Subscription
            subscription={COMMENTFLOW_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData: { data: { newCommentAddedToFile } } }) => {
              this.setState({
                extraComments: [...this.state.extraComments, newCommentAddedToFile],
              });
            }}
            variables={{ fileHash: this.props.navigation.state.params.fileObject.hash }}>
            {() => (null)}
          </Subscription>
        </ScrollView>
        <Animated.View style={[styles.inputWrapper, {
          height: this.state.bottomTabNavigatorHeight,
          transform: [{ translateY: this.state.translateY }],
          }]}>
          <Input
            ref={node => this._input = node}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            leftIcon={
              this.state.sending
                  ? <ActivityIndicator size='small' color='#000' />
                  : <Icon name='message-circle' size={25} color='black' />
            }
            returnKeyType={'send'}
            selectionColor={'pink'}
            onChangeText={(commentText: string) => this.setState({ commentText })}
            value={this.state.commentText}
            onSubmitEditing={this.sendNewComment}
            blurOnSubmit={false}
            placeholder='Have a comment'
            placeholderTextColor='black'
          />
      </Animated.View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  main: { flexDirection: 'row', height: '100%' },
  commentWrapper: {
    padding: 3,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  comment: {
    paddingHorizontal: 9,
    paddingBottom: 5,
    flex: 1,
    marginBottom: 7,
  },
  userName: { fontWeight: 'bold', fontFamily: 'Chalkduster' },
  inputWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(152, 151, 156, 0.9)',
  },
});