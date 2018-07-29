import React from "react";
import {
  View,
  Text,
  Button,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight
} from "react-native";

export class HomeScreen extends React.Component<any, { rootFolder: {contains: Array<any>, path: any}, placeIndicator: Array<any> }> {
  constructor(props: any) {
    super(props);
    this.state = {
      rootFolder: { contains: [], path: null },
      placeIndicator: []
    };
  }

  componentWillMount() {
    this.fetchFolders(0);
  }

  fetchFolders = async (hash: number) => {
    try {
      let response = await fetch(
        `http://10.1.10.15:3099/folder/${hash}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      let rootFolder = await response.json();

      this.state.placeIndicator.push(hash);
      this.setState({
        rootFolder: rootFolder
      });
    } catch (error) {
      console.error(error);
    }
  };

  loadInnerFolder(folder: {hash: number}) {
    this.fetchFolders(folder.hash);
  }

  inspectImage(imageObject: {}) {
    this.props.navigation.navigate("ImageInspect", { imageObject, folderObject: this.state.rootFolder });
  }

  renderImages() {
    return this.state.rootFolder.contains.map((fileObject, index) => {
      if (fileObject.type === "file") {
        let pathToImage = fileObject.name.slice(0, fileObject.name.lastIndexOf('.'));
        console.log(fileObject.extension)
        pathToImage += `_thumb.png`;
        console.log(pathToImage)
        return (
          <TouchableHighlight
            style={{ width: 140 }}
            onPress={() => this.inspectImage(fileObject)}
            key={index}
          >
            <Image
              source={{
                uri: `http://10.1.10.15:3099${
                  this.state.rootFolder.path
                }/${pathToImage}`
              }}
              style={{ width: 138, height: 138 }}
            />
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableOpacity
            key={index}
            style={{
              width: 138,
              height: 138,
              backgroundColor: "blue",
              borderRadius: 15
            }}
            onPress={() => this.loadInnerFolder(fileObject)}
          >
            <Text>{fileObject.name}</Text>
          </TouchableOpacity>
        );
      }
    });
  }

  goBack(hash: any, index: number) {
    this.state.placeIndicator.splice(index, this.state.placeIndicator.length);
    this.fetchFolders(hash);
  }

  renderDirectoryNavigators() {
    let indicatorButtonList = this.state.rootFolder.path
      .replace("/opt/images", "")
      .split("/");
    return indicatorButtonList.map((button: string, index: number) => {
      return (
        <Button
          key={index}
          title={button ? button : "root"}
          onPress={() => this.goBack(this.state.placeIndicator[index], index)}
        />
      );
    });
  }

  render() {
    if (!this.state.rootFolder.contains.length) return null;
    return (
      <ImageBackground
        source={require("./../static/pics.png")}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5FCFF"
        }}
      >
        <View>{this.renderDirectoryNavigators()}</View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "95%",
            height: "80%",
            backgroundColor: "red"
          }}
        >
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
          >
            {this.renderImages()}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }
}
