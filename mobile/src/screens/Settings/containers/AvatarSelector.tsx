import React from 'react';
import {
    Image,
    TouchableOpacity,
    Animated,
    FlatList,
    StyleSheet,
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import CONSTANTS from './../../../constants';

const GET_AVATARS = gql`
{
  availableAvatars {
    nameOnDisc,
    extension
  }
}
`;

export class AvatarSelector extends React.Component<any, any> {

    renderAvatarItem(item: any) {
      return (
       <TouchableOpacity
          key={item.nameOnDisc}
          onPress={() => this.props.changeAvatar(item.nameOnDisc)}>
          <Image
           style={{ width: 50, height: 50 }}
           source={{ uri: `${BACKEND_API + CONSTANTS.PATH_TO_AVATARS}/${item.nameOnDisc + item.extension}` }}
           />
       </TouchableOpacity>
      );
    }

    render() {
      return (
        <Animated.View
         style={[
               styles.avatarSelector,
               {
                 opacity: this.props.opacity,
                 transform: [{ translateX: this.props.offset }],
               },
             ]}>
          <Query query={GET_AVATARS}>
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
               <FlatList
                 keyExtractor={(item, index) => index.toString()}
                 horizontal={true}
                 data={data.availableAvatars}
                 renderItem={({ item }: any) => this.renderAvatarItem(item)}
                 />
              );
            }}
          </Query>
        </Animated.View>
      );
    }
}

const styles = StyleSheet.create({
  avatarSelector: {
    marginTop: 25,
    width: '100%',
    height: 55,
  },
});