import React from 'react';
import {
  View,
  Text,
  FlatList,
} from 'react-native';
import { BACKEND_API } from 'react-native-dotenv';

export class AvailableTags extends React.Component<any, any> {

    componentDidMount() {
        
    }

    render() {
        return (
        <View>
            <FlatList></FlatList>
        </View>
        );
    }
}