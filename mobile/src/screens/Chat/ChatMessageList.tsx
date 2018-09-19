import React from 'react';
import { Text, View, ScrollView, RefreshControl, FlatList, Dimensions, Keyboard } from 'react-native';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { BACKEND_API } from 'react-native-dotenv';
import { Avatar } from 'react-native-elements';

const OFFSET = 10;

const rawQuery = (offset) => `
{
  getChatMessages(offset: ${offset}) {
    userId,
    message,
    date
  }
}`;

const query = (offset: number) => {
  return gql`${rawQuery(offset)}`;
};

const subscription = gql`
  subscription {
    chatMessageAdded {
      userId
      message
      date
    }
  }
`;

const MessageListView = class extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      additionalMessages: [],
      willAddNewToTop: false,
      initialLoad: true,
      dragging: false,
      bc: 'red',
    };
  }

  componentDidMount() {
    this.props.subscribeToMore();
  }

  async loadAdditionalMessages (offset: number) {
    try {
        const response = await fetch(`${BACKEND_API}/mobile?query=${rawQuery(offset)}`, {
          method: 'GET',
        //   body: JSON.stringify({
        //     text,
        //     user: 'aargon',
        //   }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
        const { data } = await response.json();

        this.setState({
            additionalMessages: [...data.getChatMessages, ...this.state.additionalMessages],
            willAddNewToTop: true,
        });
      } catch (error) {
        console.error(error);
      }
  }

  render() {
    const { data } = this.props;
    const unifiedData = [...this.state.additionalMessages, ...data.getChatMessages];

    const userDisplayProperties = this.props.usersStatus.reduce((accumulator, { id, ...rest }) => {
        accumulator[id] = rest;
        return accumulator;
    }, {});
    return (
      <FlatList
        ref={ref => this.flatList = ref}
        data={unifiedData}
        scrollsToTop={false}
        onScrollBeginDrag={() => this.setState({ dragging: true })}
        onScrollEndDrag={() => this.setState({ dragging: false })}
        // contentContainerStyle={{ paddingBottom: 20 }}
        style={{ marginTop: 0, backgroundColor: this.state.bc }}
        onScroll={event => {
            // 54 bottom tab bar
            // 50 margintop
            console.log('device height - bottom n top' Dimensions.get('window').height - 50 - 54), 
            console.log(event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y)
            const condition = (event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y) - 35 < Dimensions.get('window').height - 50 - 54)
            if (condition && this.state.bc === 'red') {
                this.setState({ bc: 'blue' })
            } else if (!condition && this.state.bc === 'blue') {
                this.setState({ bc: 'red' })
            }
            // this.yOffset = event.nativeEvent.contentOffset.y
            // this.contentSize = event.nativeEvent.contentSize.height - Dimensions.get('window').height
          }}
        onContentSizeChange={() => {
            if (this.state.willAddNewToTop) {
                this.flatList.scrollToIndex({
                    index: OFFSET - 1,
                    animated: false,
                })
                this.setState({ willAddNewToTop: false });
            } else if (this.state.initialLoad) {
                console.log('init')
                setTimeout(() => this.flatList.scrollToEnd({ animated: false }), 1);
                this.setState({ initialLoad: false });
            } else if (!this.state.dragging) {
                this.flatList.scrollToEnd({ animated: false });
            }
        }}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={(v, s) => {
            // console.log('before: 'v, '    = after ][][]   : ', s)
            return <View style={{ height: 2 }}/>
        }}
        renderItem={({item, index}) => {
          console.log(`${BACKEND_API}/opt/server/avatars/${userDisplayProperties[item.userId].avatar}.png`)
          return(
            <View
            style={{ borderRadius: 10, paddingTop: 10, paddingBottom: 10, marginBottom: 5, marginTop: 5, backgroundColor: '#ABC7FF' }}
            >
            <Avatar
            avatarStyle={{opacity: .7, transform: [{scale: .9}] }}
            source={{uri: `${BACKEND_API}/opt/server/avatars/${userDisplayProperties[item.userId].avatar}.png` }}
            size={'small'}
            rounded
            containerStyle={{backgroundColor: userDisplayProperties[item.userId].color }}
            />
                <Text style={{  }}>{userDisplayProperties[item.userId].username}</Text>
                <Text style={{  }}>{item.message}</Text>
            </View>
        )}}
        refreshControl={
          <RefreshControl
            enabled={true}
            refreshing={this.state.refreshing}
            onRefresh={() => {
              this.loadAdditionalMessages(unifiedData.length);
            }}
          />
        }
      />
    );
  }
};

class MessageList extends React.Component {
    componentDidMount() {
        console.log(this.props.usersStatus)
        // subscribeToUsersStatus
        // console.log(this.props)
    }

  render() {
    return (
      <Query query={query(0)}>
        {({ loading, error, data, subscribeToMore }) => {
          console.log(loading, error, subscribeToMore);
          if (loading)
            return (
              <View>
                <Text>Loading...</Text>
              </View>
            );
          if (error)
            return (
              <View>
                <Text>error: {error.message}</Text>
              </View>
            );
          const more = () =>
            subscribeToMore({
              document: subscription,
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const { chatMessageAdded } = subscriptionData.data;
                console.log('refreshing');
                //   console.log(subscriptionData.data)
                //   if (mutation !== 'CREATED') return prev;
                return Object.assign({}, prev, {
                  getChatMessages: [...prev.getChatMessages, chatMessageAdded],
                });
              },
            });
          return <MessageListView
          data={data}
          subscribeToMore={more}
          usersStatus={this.props.usersStatus}
          />
        }}
      </Query>
    );
  }
}

export default MessageList;
