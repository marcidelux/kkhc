import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView
} from "react-native";
import Image from "react-native-scalable-image";

export class ImageInspect extends React.Component {
  state = {
    imageObject: null,
    fetched: false
  };

  componentWillMount() {
    const { navigation } = this.props;
    const imageObject = navigation.getParam("imageObject");
    this.state.imageObject = imageObject;
  }

  componentDidMount() {
    this.fetchImage(this.state.imageObject.hash);
  }

  fetchImage = async hash => {
    try {
      let response = await fetch(
        `https://${process.env.WEB_URL}/image/${hash}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      let image = await response.json();
      console.log(image);

      this.setState({
        imageObject: image,
        fetched: true
      });
    } catch (error) {
      console.error(error);
    }
  };

  renderInspectImage = () => {
    console.log(this.state.imageObject);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ScrollView
          style={{ width: "100%", height: Dimensions.get("window").height }}
          contentContainerStyle={{
            paddingBottom: 50,
            flexDirection: "row",
            flexWrap: "wrap"
          }}
        >
          <Text>
            {this.state.imageObject.name.slice(
              0,
              this.state.imageObject.name.lastIndexOf(".")
            )}
          </Text>
          <Image
            width={Dimensions.get("window").width}
            source={{
              uri: `https://${process.env.WEB_URL}${this.state.imageObject.url}`
            }}
          />
          {this.renderTags()}
          <TouchableOpacity
            onPress={this.addTag}
            style={{ backgroundColor: "red" }}
          >
            <Text style={{ marginBottom: 50 }}>Hide me!</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  renderTags = () => {
    return this.state.imageObject.tags.length > 0
      ? this.state.imageObject.tags.map((tag, index) => (
          <Text key={index}>{tag}</Text>
        ))
      : null;
  };

  addTag = () => {
    console.log(this.state.rootFolder.hash);
    this.state.imageObject.tags.push("kutya");
    console.log(this.state.imageObject.tags);
    this.setState({ imageObject: this.state.imageObject });
  };

  render() {
    if (!this.state.fetched) {
      return null;
    }
    return (
      <View style={{ flex: 0.2, position: "absolute" }}>
        {this.renderInspectImage()}
      </View>
    );
  }
}
