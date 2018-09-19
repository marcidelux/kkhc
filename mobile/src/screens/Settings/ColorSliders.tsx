import React from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-elements';

enum RGB {
  red,
  green,
  blue,
}

export class ColorSliders extends React.Component<any, any> {

  isolateColor(primaryColorName: string) {
    const colorLayers = [0, 0, 0];
    colorLayers[(RGB[(primaryColorName as any)] as any)] = this.monitorDynamicColorChange(primaryColorName);
    return `rgb(${colorLayers.toString()})`;
  }

  monitorDynamicColorChange(primaryColorName: string) {
    return this.props[primaryColorName] !== null
      ? this.props[primaryColorName]
      : this.props.originalColor[RGB[(primaryColorName as any)]];
  }

  createSliderElement = (primaryColorName: string) => (
    <Slider
      minimumTrackTintColor={'#98979c'}
      maximumTrackTintColor={'#98979c'}
      maximumValue={255}
      minimumValue={0}
      step={1}
      thumbTintColor={this.isolateColor(primaryColorName)}
      value={this.monitorDynamicColorChange(primaryColorName)}
      onValueChange={(v) => this.props.setAdditiveColor(v, primaryColorName, this.props.originalColor)}
    />
  )

  render() {
    return (
      <View>
        {this.createSliderElement(RGB[0])}
        {this.createSliderElement(RGB[1])}
        {this.createSliderElement(RGB[2])}
      </View>
    );
  }
}
