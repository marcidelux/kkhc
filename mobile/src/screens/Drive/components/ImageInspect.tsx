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
import { NavigationComponent } from 'react-navigation';
import { observer } from 'mobx-react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

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

const COMMENTFLOW_SUBSCRIPTION = gql`
subscription newCommentAddedToFile($fileHash: Int!) {
  newCommentAddedToFile(fileHash: $fileHash) {
    text,
    userId,
    id,
    date,
  }
}`;

export class ImageInspect extends React.Component<any, {
  text: string}> {

  static navigationOptions = ({ navigation }: { navigation: NavigationComponent }) => ({
    title: navigation.state.params.imageObject.name,
  })

  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
    };
  }

  componentDidMount() {
  }

  // renderTags = () => this.props.navigation.state.params.imageObject.tags.length > 0
  //     ? this.props.navigation.state.params.imageObject.tags.map((tag: {}, index: number) => (
  //         <Text key={index}>{tag}</Text>
  //       ))
  //     : null

  render() {
    const imageObject = this.props.navigation.state.params.imageObject;
    const userDisplayProperties = this.props.screenProps.usersStatus.reduce((accumulator, { id, ...rest }) => {
      accumulator[id] = rest;
      return accumulator;
  }, {});
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
              uri: `${BACKEND_API}${imageObject.path.replace()}`,
            }}
          />
          {/* {this.renderTags()} */}
          <Query query={GET_COMMENTFLOW} variables={{ fileHash: imageObject.hash }}>
            {({ loading, error, data, subscribeToMore }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;

              const subscribeToMoreComments = () => subscribeToMore({
                document: COMMENTFLOW_SUBSCRIPTION,
                variables: { fileHash: imageObject.hash },
                updateQuery: (previous, { subscriptionData }) => {
                  if (!subscriptionData.data) return previous;
                  const { newCommentAddedToFile } = subscriptionData.data;
                  //   console.log(subscriptionData.data)
                  //   if (mutation !== 'CREATED') return prev;
                  return Object.assign({}, previous, {
                    getCommentFlow: {
                      ...previous.getCommentFlow,
                      comments: [...previous.getCommentFlow.comments, newCommentAddedToFile],
                    },
                  });
                },
              });
              return (
                <Comments
                  userStatus={userDisplayProperties}
                  comments={data.getCommentFlow.comments}
                  more={subscribeToMoreComments}/>
              );
            }}
          </Query>
          <TouchableOpacity
            // onPress={() => this.state.text === ''
            // ? null
            // : this.store.addComment(imageObject.hash, this.state.text)}
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
