import { Text } from 'react-native';
import React from 'react';

export default ({ comments }) => {
    return comments.map((comment, index) => (
      <Text key={index}>
        {comment.user} | {comment.text}
      </Text>
      ));
  };