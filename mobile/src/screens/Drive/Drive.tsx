import React from 'react';
import gql from 'graphql-tag';
import R from 'ramda';
import autobind from 'autobind-decorator';

import { FeatherHeaderButtons, Item } from './components/headerButton';
import { Breadcrumbs } from './components/BreadCrumbs';
import FileList from './containers/FileList';
import client from './../../client';
import CONSTANTS from './../../constants';

const GET_FOLDER_CONTENT = gql`
query getFolderContent($hash: Int!) {
  getFolderContent(hash: $hash) {
    name,
    path,
    hash,
    type,
    hashPath,
    contains {
      ... on Folder {
        name,
        path,
        hash,
        type,
        hashPath,
      }
      ... on Image {
        name,
        path,
        hash,
        type,
        parentHash,
        extension,
      }
      ... on Video {
        name,
        path,
        hash,
        type,
        parentHash,
        extension,
      }
    }
  }
}`;

export class DriveScreen extends React.Component<any, { rootFolder: {contains: Array<any>, path: any}, placeIndicators: Array<any> }> {
  static navigationOptions = ({ navigation }: { navigation: any }) => {
    let breadCrumbs: Array<any> = [];
    if (navigation.state.params && navigation.state.params.rootFolder) {
      breadCrumbs = navigation.state.params.rootFolder.path
        .replace(CONSTANTS.PATH_TO_DRIVE, '')
        .split('/')
        .map((button: string, index: number) => ({ title: button, key: index.toString() }));
    }
    return {
      headerLeft: (
        <Breadcrumbs
          data={breadCrumbs}
          goBack={DriveScreen.goBack}
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

  @autobind
  static goBack({ fetchFolder, breadCrumbNavigation, placeIndicators }: any, index: number): void {
    if (placeIndicators.length - 1 === index) return;
    breadCrumbNavigation(index);
    fetchFolder(placeIndicators[index]);
  }

  constructor(props) {
    super(props);
    this.state = {
      rootFolder: null,
      placeIndicators: [],
    };
  }

  componentDidMount(): void {
    const {
      fetchFolder,
      breadCrumbNavigation,
    } = this;
    fetchFolder(0);
    this.props.navigation.setParams({
      fetchFolder,
      breadCrumbNavigation,
    });
  }

  @autobind
  breadCrumbNavigation(index: number) {
    this.setState({
      placeIndicators: R
        .dropLast(this.state.placeIndicators.length - index, this.state.placeIndicators),
    });
  }

  @autobind
  async fetchFolder(hash: number): Promise<void> {
    const { data: { getFolderContent } } = await client.query({
      query: GET_FOLDER_CONTENT,
      variables: { hash },
    });

    this.setState({
      rootFolder: getFolderContent,
      placeIndicators: [...this.state.placeIndicators, getFolderContent.hash],
    });
    this.props.navigation.setParams({
      ...this.state,
    });
  }

  render() {
    const {
      navigation,
    } = this.props;

    if (this.state.rootFolder === null) return null;

    return (
      <FileList
        rootFolder={this.state.rootFolder}
        fetchFolder={this.fetchFolder}
        navigation={navigation}/>
    );
  }
}
