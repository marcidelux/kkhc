import React from 'react';
import { View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Slider } from 'react-native-elements';

enum RGB {
  red,
  green,
  blue,
}

const screen = Dimensions.get('window');

export class ColorSliders extends React.Component<any, any> {

  setSliderValueOnTap(e: any, primaryColorName: string): void {
    let v = (e.nativeEvent.locationX - 7.5) / (screen.width - 100);
    v = (v > 1 || v < 0) ? Math.abs(Math.round(v)) : v;
    this.props.setAdditiveColor(Math.round(v * 255), primaryColorName, this.props.originalColor);
  }

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
    <TouchableWithoutFeedback onPressIn={(e) => this.setSliderValueOnTap(e, primaryColorName)}>
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
    </TouchableWithoutFeedback>
  )

  render() {
    return (
      <View style={{ width: screen.width - 100, alignSelf: 'center', zIndex: 2 }}>
        {this.createSliderElement(RGB[0])}
        {this.createSliderElement(RGB[1])}
        {this.createSliderElement(RGB[2])}
      </View>
    );
  }
}
