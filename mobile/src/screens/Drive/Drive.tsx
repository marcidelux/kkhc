import React from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { FeatherHeaderButtons, Item } from './components/headerButton';
import { Breadcrumbs } from './components/BreadCrumbs';
import { breadCrumbNavigation, fetchFolder } from '../../actions/driveActions';
import FileList from './containers/FileList';

class DriveScreen extends React.Component<any, { rootFolder: {contains: Array<any>, path: any}, placeIndicator: Array<any> }> {
  static navigationOptions = ({ navigation }: { navigation: any }) => {
    let breadCrumbs: Array<any> = [];
    if (navigation.state.params) {
      breadCrumbs = navigation.state.params.rootFolder.path
        .replace('/opt/images', '')
        .split('/')
        .map((button: string, index: number) => ({ title: button, key: index.toString() }));
    }
    return {
      headerLeft: (
        <Breadcrumbs
          data={breadCrumbs}
          goBack={DriveScreen.goBack.bind(DriveScreen)}
          navigationParams={navigation.state.params} />
      ),
      headerRight: (
        <FeatherHeaderButtons>
          <Item
            title='Search'
            iconName='search'
            onPress={() => navigation.navigate('Search')} />
        </FeatherHeaderButtons>
      ),
    };
  }

  static goBack(params: any, index: number): void {
    const { fetchFolder, breadCrumbNavigation, placeIndicator } = params;
    if (placeIndicator.length - 1 === index) return;
    breadCrumbNavigation(index);
    fetchFolder(placeIndicator[index]);
  }

  componentDidMount(): void {
    this.props.fetchFolder(0);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.rootFolder.hash !== this.props.rootFolder.hash) {
      this.props.navigation.setParams({
        rootFolder: this.props.rootFolder,
        placeIndicator: this.props.placeIndicator,
        breadCrumbNavigation: this.props.breadCrumbNavigation,
        fetchFolder: this.props.fetchFolder,
      });
    }
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
        <FileList
          rootFolder={rootFolder}
          fetchFolder={fetchFolder}
          navigation={navigation}/>
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
        return dispatch(fetchFolder(hash));
    },
    breadCrumbNavigation: (index: number) => {
      dispatch(breadCrumbNavigation(index));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DriveScreen);
