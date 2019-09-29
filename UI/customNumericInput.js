import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

import NumericInput from "react-native-numeric-input";

import logger from "../controllers/logger";

const codeFileName = "customNumericInput";

export default class CustomNumericInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.minValue };
  }

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
            this.setState({ value });
            this.props.valueChangeCallback(this.state.value);
          }}
          onLimitReached={(isMax, msg) =>
            logger.warn(
              codeFileName,
              "onLimitReached",
              "isMax:" + isMax + ", message:" + msg
            )
          }
          totalWidth={200}
          totalHeight={40}
          minValue={this.props.minValue}
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

CustomNumericInput.propTypes = {
  minValue: PropTypes.number,
  valueChangeCallback: PropTypes.func.isRequired
};

CustomNumericInput.defaultProps = {
  minValue: 0
};
