import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import Image from 'react-native-scalable-image';
import { BACKEND_API } from 'react-native-dotenv';
import Comments from './Comments';
import { NavigationComponent } from 'react-navigation';
import { observer } from 'mobx-react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Tags from './Tags';
import Icon from 'react-native-vector-icons/Feather';

const GET_COMMENTFLOW = gql`
query getCommentFlow($fileHash: Int!) {
  getCommentFlow(fileHash: $fileHash) {
    comments {
      text,
      userId,
      date,
      id
    }
    belongsTo
  }
}`;

const GET_TAGFLOW = gql`
query getTagFlow($fileHash: Int!) {
  getTagFlow(fileHash: $fileHash) {
    tagPrimitives {
      name,
      userId,
    }
    belongsTo
  }
}`;

const COMMENTFLOW_SUBSCRIPTION = gql`
subscription newCommentAddedToFile($fileHash: Int!) {
  newCommentAddedToFile(fileHash: $fileHash) {
    text,
    userId,
    id,
    date,
  }
}`;

const TAGFLOW_SUBSCRIPTION = gql`
subscription newTagAddedToFile($fileHash: Int!) {
  newTagAddedToFile(fileHash: $fileHash) {
    name,
    userId,
  }
}`;

const width = Dimensions.get('window').width;

export class FileInspect extends React.Component<any, {
  text: string}> {

  static navigationOptions = ({ navigation }: { navigation: NavigationComponent }) => ({
    title: navigation.state.params.fileObject.name,
  })

  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
    };
  }

  componentDidMount() {
  }

  tagFlowWrapper(fileObject: any, userDisplayProperties: any) {
    return (
      <Query query={GET_TAGFLOW} variables={{ fileHash: fileObject.hash }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;

          const subscribeToMoreTags = () => subscribeToMore(this.moreTagsHandler(fileObject));
          return (
            <Tags
              userStatus={userDisplayProperties}
              tags={data.getTagFlow.tagPrimitives}
              more={subscribeToMoreTags}/>
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
        const { newTagAddedToFile } = subscriptionData.data;
        return Object.assign({}, previous, {
          getTagFlow: {
            ...previous.getTagFlow,
            tagPrimitives: [...previous.getTagFlow.tagPrimitives, newTagAddedToFile],
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
              more={subscribeToMoreComments}/>
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

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          style={{ width: '100%', height: Dimensions.get('window').height }}
          contentContainerStyle={{
            paddingBottom: 50,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          <Image
            width={width}
            source={{ uri: BACKEND_API + fileObject.path }}
          />
          {this.tagFlowWrapper(fileObject, userDisplayProperties)}
          {this.commentFlowWrapper(fileObject, userDisplayProperties)}
          <TouchableOpacity
            // onPress={() => this.state.text === ''
            // ? null
            // : this.store.addComment(fileObject.hash, this.state.text)}
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
    );
  }
}

const styles = StyleSheet.create({

});
