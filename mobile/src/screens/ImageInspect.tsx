import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  TextInput
} from "react-native";
import Image from "react-native-scalable-image";

export class ImageInspect extends React.Component<any, { imageObject: {commentFlow: string, name: string, url: string, tags: Array<any>, hash: number}, folderObject: { hash: number }, comments: Array<any>, fetched: boolean, text: string}> {
  
  constructor(props: any) {
    super(props);
    this.state = {
      imageObject: null,
      folderObject: null,
      comments: null,
      fetched: false,
      text: null,
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    const imageObject = navigation.getParam("imageObject");
    const folderObject = navigation.getParam("folderObject");
    this.setState({
      imageObject,
      folderObject,
    })
  }

  componentDidMount() {
    this.fetchImage(this.state.imageObject.hash);
    console.log(this.state.imageObject, "[][][][][][][][][]");
  }

  fetchImage = async (hash: number) => {
    try {
      let response = await fetch(`http://10.1.10.15:3099/image/${hash}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      });
      let image = await response.json();
      console.log(image);

      this.setState({
        imageObject: image,
        fetched: true
      });
      this.getComments(this.state.imageObject.commentFlow);
    } catch (error) {
      console.error(error);
    }
  };

  getComments = async (commentFlowId: string) => {
    try {
      let response = await fetch(
        `http://10.1.10.15:3099/getCommentFlow/${commentFlowId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      let { comments } = await response.json();
      console.log(comments, "====-=-=-=-=-=-=-=");
      this.setState({
        comments
      });
      console.log(this.state.comments);
    } catch (error) {
      console.error(error);
    }
  };

  renderInspectImage = () => {
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
              uri: `http://10.1.10.15:3099${this.state.imageObject.url}`
            }}
          />
          {this.renderTags()}
          {this.renderComments()}
          <TouchableOpacity
            onPress={this.addComment}
            style={{ backgroundColor: "red" }}
          >
            <Text style={{ marginBottom: 50 }}>Sub ur Comment</Text>
            <TextInput
              style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
              onChangeText={text => this.setState({ text })}
              value={this.state.text}
              // onSubmitEditing={this.addComment}
              placeholder="Have a Comment!"
              placeholderTextColor="grey"
              multiline={true}
              maxLength={250}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  renderComments = () => {
    console.log(this.state.comments);
    console.log(Array.isArray(this.state.comments), "COMMENTS");
    return Array.isArray(this.state.comments)
      ? this.state.comments.map((comment, index) => (
          <Text key={index}>
            {comment.user} | {comment.text}
          </Text>
        ))
      : null;
  };

  renderTags = () => {
    return this.state.imageObject.tags.length > 0
      ? this.state.imageObject.tags.map((tag: {}, index: number) => (
          <Text key={index}>{tag}</Text>
        ))
      : null;
  };

  addComment = async () => {
    try {
      let response = await fetch(
        `http://10.1.10.15:3099/addToCommentFlow/${JSON.stringify({
          imageHash: this.state.imageObject.hash,
          folderHash: this.state.folderObject.hash,
          commentFlowHash: this.state.imageObject.commentFlow
        })}`,
        {
          method: "POST",
          body: JSON.stringify({
            text: this.state.text,
            user: "aargon"
          }),
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      let { comments } = await response.json();
      if (comments) {
        this.setState({
          comments,
          text: '',
        });
      }
    } catch (error) {
      console.error(error);
    }

    // this.setState({ imageObject: this.state.imageObject });
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
