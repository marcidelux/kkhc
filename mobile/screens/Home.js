import React from 'react';
import { View, Text, Button, ImageBackground, Image, ScrollView } from 'react-native';

export class HomeScreen extends React.Component {

  constructor(){
        super();
        this.state = {
            folders: []
        }
    }

  componentWillMount() {
    fetchFolders = async () => {
        try {
          let response = await fetch(
            'http://10.1.10.24:3099/folder/1530370184755',
              {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
        }});
          let folder = await response.json();


          const uriImages = [];
          folder.contains.forEach((file) => uriImages.push(`http://10.1.10.24:3099${folder.path}/${file.name}`))
          this.setState({
            folders: uriImages
          })
          console.log(this.state)
        } catch (error) {
          console.error(error);
        }
      };
    fetchFolders()
    
    }

  renderImages() {
    return this.state.folders.map(function(imageUri, index) {
      console.log(imageUri)
      return <Image
        source={{uri: imageUri}}
        key={index}
        style={{width: 138, height: 138}} />
    })
  }

  render() {
    if(!this.state.folders.length)
        return null;
    return (
      <ImageBackground source={require('./pics.png')} style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5FCFF" }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Dope Screen</Text>
          <Image source={{uri: "http://192.168.0.15:3099/opt/images/majom/fehér_majom/357480_0_9999_med_v1_m56577569855411056.png"}} style={{width: 50, height: 50}}>
          </Image>
          {this.renderImages()}
          <Button
            title="Go to Details"
            onPress={() => console.log(this.state)}
          />
        </View>
      </ImageBackground>
    );
  }
}