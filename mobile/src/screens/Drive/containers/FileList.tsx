import React from 'react';
import {
  View,
  Text,
  Button,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { getComments } from '../../../actions/FileListActions';

class FileList extends React.Component<any, any> {

  renderImages(): TouchableHighlight {
    return this.props.rootFolder.contains.map((fileObject: { name: string, hash: number, type: string, path: string }, index: number) => {
      if (fileObject.type === 'file') {
        const pathToImage = `${fileObject.name.slice(0, fileObject.name.lastIndexOf('.'))}_thumb.png`;
        return (
          <TouchableHighlight
            style={{ width: 140 }}
            onPress={() => this.inspectImage(fileObject)}
            key={index}>
            <Image
              source={{
                uri: `${BACKEND_API}${this.props.rootFolder.path}/${pathToImage}`,
              }}
              style={{ width: 138, height: 138 }}/>
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableOpacity
            key={index}
            style={{
              width: 138,
              height: 138,
              backgroundColor: 'blue',
              borderRadius: 15,
            }}
            onPress={() => this.props.fetchFolder(fileObject.hash)}>
            <Text>{fileObject.name}</Text>
          </TouchableOpacity>
        );
      }
    });
  }

  inspectImage(imageObject: any): void {
    this.props.getComments(imageObject.hash).then(({ payload }) => {
      this.props.navigation.navigate('ImageInspect', { imageObject, comments: payload.comments });
    });
  }

  render() {
    return (
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {this.renderImages()}
      </ScrollView>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, null, Action>) => ({
    getComments: (hash: number) => {
      return dispatch(getComments(hash));
    },
});

export default connect(null, mapDispatchToProps)(FileList);