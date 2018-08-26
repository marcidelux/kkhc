import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const screen = Dimensions.get('window');
export class Breadcrumbs extends React.Component<any, any> {
  render() {
    let flatList: any;
    return (
      <View style={styles.main}>
        <FlatList
          ref={(ref) => (flatList = ref)}
          onContentSizeChange={() => flatList.scrollToEnd({ animated: true })}
          onLayout={() => flatList.scrollToEnd({ animated: true })}
          style={styles.flatList}
          data={this.props.data}
          horizontal={true}
          ItemSeparatorComponent={() => (
            <Icon style={styles.separatorIcon} name='chevron-right' size={24} color='#000' />
          )}
          renderItem={({ item, index }: any) => (
            <TouchableOpacity
              key={index}
              style={styles.breadcrumb}
              onPress={() => this.props.goBack(this.props.navigationParams, index)}>
              <Text
                style={[
                    styles.breadcrumbText,
                    (index + 1 === this.props.data.length)
                    ? styles.isLast
                    : {},
                ]}>
                {item.title ? item.title : <Icon style={{ alignSelf: 'center' }} name='home' size={20} />}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    width: screen.width - 80,
    backgroundColor: 'pink',
    borderRadius: 15,
    margin: 2,
    paddingLeft: 10,
    paddingRight: 10,
  },
  flatList: {
    width: '100%',
  },
  breadcrumb: {
    flex: 1,
    justifyContent: 'center',
  },
  separatorIcon: {
    alignSelf: 'center',
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#000',
    alignSelf: 'center',
  },
  isLast: {
    color: '#b60852',
  },
});
