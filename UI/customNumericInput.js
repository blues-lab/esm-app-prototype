import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight
} from "react-native";

import NumericInput from "react-native-numeric-input";

export default class CustomNumericInput extends React.Component {
  state = { value: 0 };
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "space-around"
        }}
      >
        <NumericInput
          style={{
            marginTop: 100,
            marginBottom: 30,
            paddingTop: 10,
            paddingBottom: 30
          }}
          value={this.state.value}
          onChange={value => {
            this.setState({ value: value });
            this.props.valueChangeCallback(this.state.value);
          }}
          onLimitReached={(isMax, msg) => console.log(isMax, msg)}
          totalWidth={200}
          totalHeight={40}
          minValue={0}
          maxValue={100}
          iconSize={25}
          step={1}
          valueType="integer"
          rounded
          textColor="#B0228C"
          iconStyle={{ color: "white" }}
          rightButtonBackgroundColor="#66c1e5"
          leftButtonBackgroundColor="#92d3ed"
        />
      </View>
    );
  }
}
