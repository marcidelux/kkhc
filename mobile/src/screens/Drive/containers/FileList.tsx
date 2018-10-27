import React from 'react';
import {
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/Feather';
import CONSTANTS from './../../../constants';

declare type FileObject = { name: string, hash: number, type: string, path: string };

const screen = Dimensions.get('window');
const divider = 4;
const space = divider - 1;
const imageSize = screen.width / 3 - divider;

export default class FileList extends React.Component<any, any> {

  renderFiles(): any {
    const sortedFiles = this.props.rootFolder.contains
      .reduce(this.sortFiles.bind(this), { folders: [], files: [] });
    return [
      ...sortedFiles.folders,
      ...sortedFiles.files,
    ];
  }

  sortFiles(accumulator: any, fileObject: FileObject) {
    fileObject.type === CONSTANTS.DRIVE_FILES.FOLDER.TYPE
      ? accumulator.folders.push(this.createFolder(fileObject))
      : accumulator.files.push(this.createFile(fileObject));
    return accumulator;
  }

  createFile(fileObject: FileObject) {
    const pathToImage = `${fileObject.name.slice(0, fileObject.name.lastIndexOf('.'))}_thumb.png`;
    if (fileObject.type === CONSTANTS.DRIVE_FILES.IMAGE.TYPE) {
      return (
      <TouchableHighlight
        style={styles.imageWrapper}
        onPress={() => this.inspectImage(fileObject)}
        key={fileObject.hash}>
        <Image
          resizeMode={'contain'}
          source={{
            uri: `${BACKEND_API + this.props.rootFolder.path}/${pathToImage}`,
          }}
          style={styles.image}/>
      </TouchableHighlight>
      );
    } else if (fileObject.type === CONSTANTS.DRIVE_FILES.VIDEO.TYPE) {
      return (
        <TouchableHighlight
          style={{
            backgroundColor: 'red',
            borderRadius: 5,
            marginLeft: space,
            width: imageSize,
            marginTop: space / 2,
            marginBottom: space / 2,
          }}
          onPress={() => this.inspectImage(fileObject)}
          key={fileObject.hash}>
          <Image
            resizeMode={'contain'}
            source={{
              uri: `${BACKEND_API + this.props.rootFolder.path}/${pathToImage}`,
            }}
            style={styles.image}/>
        </TouchableHighlight>
        );
    }
  }

  createFolder(fileObject: FileObject) {
    return (
    <TouchableOpacity
      key={fileObject.hash}
      style={styles.folder}
      onPress={() => this.props.fetchFolder(fileObject.hash)}>
      <Text style={styles.folderText}>{fileObject.name}</Text>
      <Icon
        style={styles.folderIcon}
        name='folder'
        size={imageSize - 10}
      >
      </Icon>
    </TouchableOpacity>
    );
  }

  inspectImage(fileObject: any): void {
    this.props.navigation.navigate('FileInspect', { fileObject });
  }

  render() {
    return (
      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContentContainer}>
        {this.renderFiles()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    height: '100%',
  },
  mainContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-evenly',
  },
  imageWrapper: {
    backgroundColor: 'white',
    borderRadius: 5,
    marginLeft: space,
    width: imageSize,
    marginTop: space / 2,
    marginBottom: space / 2,
  },
  image: {
    alignSelf: 'center',
    width: imageSize - space,
    height: imageSize - space,
  },
  folder: {
    marginLeft: space,
    width: imageSize,
    height: imageSize,
    backgroundColor: '#dedee0',
    borderRadius: 5,
    marginTop: space / 2,
    marginBottom: space / 2,
  },
  folderText: {
    fontFamily: 'Chalkduster',
    fontSize: 16,
    position: 'absolute',
    bottom: 10,
    left: 5,
    color: '#000',
  },
  folderIcon: {
    alignSelf: 'center',
    opacity: .8,
    zIndex: -1,
    color: '#fff',
  },
});
