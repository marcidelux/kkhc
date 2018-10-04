import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { MainRouter } from './MainRouter';

const subscription = gql`
subscription {
  userUpdated {
    id
    username
    avatar
    isOnline
    color
  }
}
`;

const query = gql`
{
  usersStatus {
    id,
    username,
    avatar,
    isOnline,
    color,
  }
}
`;

export default class MainFlow extends React.Component<any, any> {
  static router = MainRouter.router;

  render() {
    return (
      <Query query={query}>
        {({ loading, error, data, subscribeToMore }) => {
          const { usersStatus } = data;
          const subscribeToUsersStatus = () =>
            subscribeToMore({
              document: subscription,
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const { userUpdated } = subscriptionData.data;
                return Object.assign({}, prev, {
                  usersStatus: [...prev.usersStatus]
                    .map((user) => user.id === userUpdated.id
                      ? userUpdated
                      : user),
                });
              },
            });
          return (
            <MainRouter
              navigation={this.props.navigation}
              screenProps={{subscribeToUsersStatus, usersStatus}}/>
          );
        }}
      </Query>
    );
  }
}
