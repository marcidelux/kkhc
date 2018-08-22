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
import { connect } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { FeatherHeaderButtons, Item } from './components/headerButton';
import { breadCrumbNavigation, fetchFolder } from '../../actions/driveActions';
import FileList from './containers/FileList';

class DriveScreen extends React.Component<any, { rootFolder: {contains: Array<any>, path: any}, placeIndicator: Array<any> }> {
  static navigationOptions = ({ navigation }: { navigation: { navigate: Function } }) => ({
    title: 'Drive',
    headerRight: (
      <FeatherHeaderButtons>
        <Item title='Search' iconName='search' onPress={() => navigation.navigate('Search')} />
      </FeatherHeaderButtons>
    ),
  })

  componentWillMount(): void {
    this.props.fetchFolder(0);
  }

  goBack(hash: any, index: number): void {
    const { placeIndicator } = this.props;
    if (placeIndicator.length - 1 === index) return;
    this.props.breadCrumbNavigation(index);
    this.props.fetchFolder(hash);
  }

  renderDirectoryNavigators(): Button {
    const indicatorButtonList = this.props.rootFolder.path
      .replace('/opt/images', '')
      .split('/');
    return indicatorButtonList.map((button: string, index: number) => {
      return (
        <Button
          key={index}
          title={button ? button : 'root'}
          onPress={() => this.goBack(this.props.placeIndicator[index], index)}/>
      );
    });
  }

  render() {
    const {
      folderLoading,
      rootFolder,
      fetchFolder,
      navigation,
    } = this.props;
    if (folderLoading) {
      return null;
    }
    return (
      <ImageBackground
        source={require('./../../static/pics.png')}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5FCFF'}}>
        <View>{this.renderDirectoryNavigators()}</View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '80%',
            backgroundColor: 'red'}}>
          <FileList
            rootFolder={rootFolder}
            fetchFolder={fetchFolder}
            navigation={navigation}/>
        </View>
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => ({
  rootFolder: state.drive.rootFolder,
  placeIndicator: state.drive.placeIndicator,
  folderLoading: state.drive.folderLoading,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, null, Action>) => ({
    fetchFolder: (hash: number) => {
        dispatch(fetchFolder(hash));
    },
    breadCrumbNavigation: (index: number) => {
      dispatch(breadCrumbNavigation(index));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DriveScreen);
