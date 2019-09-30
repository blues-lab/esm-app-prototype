import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
  TouchableHighlight,
  Image,
  BackHandler
} from "react-native";

import Icon from "react-native-vector-icons/Fontisto";
import logger from "../controllers/logger";

import commonStyles from "./Style";

const codeFileName = "radioButtonGroup.js";

export default class CustomRadioButtonGroup extends React.Component {
  state = {
    items: null, //all radio items
    selectedItemKey: null //key of the currently selected item
  };

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const _items = navigation.getParam("items", null);

    await this.promisedSetState({
      items: _items
    });
  }

  componentWillUnmount() {}

  handleItemSelection = async item => {
    //call parent component to update item selection
    //await this.props.navigation.state.params.itemSelectionHandler(

    //);

    await this.promisedSetState({ selectedItemKey: item.key });
  };

  //    logger.info(
  //      `${codeFileName}`,
  //      "handleServiceSelection",
  //      `Parameter:${selectedServiceName}.Services:${JSON.stringify(
  //        _serviceNames
  //      )}`
  //    );

  //    this.setState({ serviceNames: _serviceNames });

  render() {
    return this.state.items.map(item => {
      return (
        <TouchableOpacity
          key={item.key}
          onPress={this.handleItemSelection.bind(this, item.key)}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-around"
            }}
          >
            <View
              style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#000",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {item.key == this.state.selectedItemKey ? (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: "#000"
                  }}
                />
              ) : null}
            </View>
            {item.value}
          </View>
        </TouchableOpacity>
      );
    });
  }
}

const styles = StyleSheet.create({
  selectedItemStyle: {
    backgroundColor: "#9dd7fb",
    padding: 10,
    height: 60
  }
});
