import React, { Component } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

export class ImageModal extends Component {
  state = {
    isModalVisible: false
  };

  openModal = (imageObject) => {
    console.log(imageObject)
    this.setState({ isModalVisible: true });
  }
  closeModal = () => {
    this.setState({ isModalVisible: false });
  }

  render() {
    return (
      <View style={{ flex: .2, position: 'absolute' }}>
        <Modal isVisible={this.state.isModalVisible}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Hello!</Text>
            <TouchableOpacity onPress={this.closeModal}>
              <Text>Hide me!</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }
}