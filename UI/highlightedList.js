import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  Image,
  TextInput,
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Modal
} from "react-native";
import * as RNFS from "react-native-fs";

import ElevatedView from "react-native-elevated-view";
import Dialog from "react-native-dialog";
import DialogInput from "react-native-dialog-input";

import ServicePermissionScreen from "./servicePermission";

const serviceFileAsset = "services.js";
const serviceFileLocal = RNFS.DocumentDirectoryPath + "/services.js";

export default class HighlightedFlatList extends Component {
  state = {
    serviceCategoryNames: ["a", "b", "c", "d"],
    selected: (new Map(): Map<string, boolean>) //iterable object with string:boolean key:value pairs
  };

  onPressAction = (key: string) => {
    this.setState(state => {
      //create new Map object, maintaining state immutability
      const selected = new Map(state.selected);
      //remove key if selected, add key if not selected
      this.state.selected.has(key)
        ? selected.delete(key, !selected.get(key))
        : selected.set(key, !selected.get(key));
      return { selected };
    });
  };

  renderRow = item => {
    return (
      <RowItem
        item={item}
        onPressItem={this.onPressAction}
        selected={!!this.state.selected.get(item.key)}
      />
    );
  };

  render() {
    return (
      <FlatList
        style={styles.container}
        data={this.state.serviceCategoryNames}
        renderItem={({ item }) => this.renderRow(item)}
        extraData={this.state}
        keyExtractor={item => item.toString()}
      />
    );
  }
}

class RowItem extends Component {
  render() {
    //render styles and components conditionally using this.props.selected ? _ : _

    return (
      <TouchableOpacity onPress={this.props.onPressItem}>
        <View>
          <Text>item.value</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  selectedButton: {
    backgroundColor: "lightgray"
  },
  normalButton: {
    backgroundColor: "white"
  },
  listItemContainer: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  text: {
    marginLeft: 12,
    fontSize: 16
  },
  selectedText: {
    marginLeft: 12,
    fontSize: 20
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20
  }
});
