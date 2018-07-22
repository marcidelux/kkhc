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

export class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      rootFolder: { contains: [] },
      placeIndicator: []
    };
  }

  componentWillMount() {
    this.fetchFolders(0);
  }

  fetchFolders = async hash => {
    try {
      let response = await fetch(
        `https://${process.env.WEB_URL}/folder/${hash}`,
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

  loadInnerFolder(folder) {
    this.fetchFolders(folder.hash);
  }

  inspectImage(imageObject) {
    this.props.navigation.navigate("ImageInspect", { imageObject });
  }

  renderImages() {
    return this.state.rootFolder.contains.map((fileObject, index) => {
      if (fileObject.type === "file") {
        return (
          <TouchableHighlight
            style={{ width: 140 }}
            onPress={() => this.inspectImage(fileObject)}
            key={index}
          >
            <Image
              source={{
                uri: `https://${process.env.WEB_URL}${
                  this.state.rootFolder.path
                }/${fileObject.name}`
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

  goBack(hash, index) {
    this.state.placeIndicator.splice(index, this.state.placeIndicator.length);
    this.fetchFolders(hash);
  }

  renderDirectoryNavigators() {
    let indicatorButtonList = this.state.rootFolder.path
      .replace("/opt/images", "")
      .split("/");
    return indicatorButtonList.map((button, index) => {
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
        source={require("./pics.png")}
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
