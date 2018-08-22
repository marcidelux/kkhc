import * as React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import HeaderButtons, { HeaderButton } from 'react-navigation-header-buttons';

const FeatherHeaderButton = props => (
  <HeaderButton {...props} IconComponent={Icon} iconSize={23} color='gray' />
);

export const FeatherHeaderButtons = props => {
  return (
    <HeaderButtons
      HeaderButtonComponent={FeatherHeaderButton}
      OverflowIcon={<Icon name='search' size={23} color='gray' />}
      {...props}
    />
  );
};
export const Item = HeaderButtons.Item;