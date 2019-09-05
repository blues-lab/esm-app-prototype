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
  Modal,
  ScrollView,
  TouchableHighlight,
  Image
} from "react-native";
import * as RNFS from "react-native-fs";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";

import DialogInput from "react-native-dialog-input";
//import SelectMultiple from 'react-native-select-multiple';
import NumericInput from "react-native-numeric-input";
import Icon from "react-native-vector-icons/Fontisto";
import { CheckBox } from "react-native-elements";

//import CheckBoxes from 'react-native-group-checkbox'

const serviceFileAsset = "services.js";
const serviceFileLocal = RNFS.DocumentDirectoryPath + "/services.js";

import logger from "../controllers/logger";
const codeFileName = "relations.js";

const checkBoxWidth = 25;
const checkBoxHeight = 25;

export default class Relations extends React.Component {
  state = {
    familySelected: false,
    friendSelected: false,
    acquaintanceSelected: false,
    colleaguesSelected: false,
    roommatesSelected: false,
    workerSelected: false,
    unknownSelected: false,
    selectedRelations: [],
    otherDialogVisible: false,
    otherRelationName: "",
    relationNames: [
      {
        name: "Family members",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Friends",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Acquaintance",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Colleagues",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Roommates/other tenants",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Domestic worker/nanny",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Unknown",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      },
      {
        name: "Other",
        renderStyle: styles.unselectedStyle,
        iconName: "checkbox-passive",
        selected: false
      }
    ]
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setState({
      familySelected: false,
      friendSelected: false,
      selectedRelations: []
    });
  }

  handleSelectionChange(index) {
    _relationNames = this.state.relationNames;
    _relationNames[index].selected = !_relationNames[index].selected;
    _name = _relationNames[index].name;
    _selected = _relationNames[index].selected;
    if (_selected) {
      //check if 'other' was selected
      if (_relationNames[index].name == "Other") {
        this.setState({ otherDialogVisible: true });
      }
      _relationNames[index].iconName = "checkbox-active";
    } else {
      _relationNames[index].iconName = "checkbox-passive";
    }

    logger.info(
      `${codeFileName}`,
      "handleSelectionChange",
      `relation: ${_relationNames[index].name}, selected: ${_relationNames[index].selected}`
    );

    this.setState({ relationNames: _relationNames });

    const _selectedRelations = this.getSelectedRelations();
    logger.info(
      codeFileName,
      "handleSelectionChange",
      "Invoking call back, selected relations:" + Array.from(_selectedRelations)
    );
    this.props.relationSelectionHandler(_selectedRelations);
  }

  getSelectedRelations() {
    _relationNames = this.state.relationNames;
    _selectedRelations = new Set([]);
    for (i = 0; i < _relationNames.length; i++) {
      if (_relationNames[i].selected) {
        if (_relationNames[i].name != "Other") {
          _selectedRelations.add(_relationNames[i].name);
        }
      }
    }
    return _selectedRelations;
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "stretch",
          margin: 10
          //backgroundColor:'lightcyan',
        }}
      >
        <View style={styles.rowView}>
          <TouchableHighlight
            style={this.state.relationNames[0].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 0)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[0].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[0].name}
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={this.state.relationNames[1].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 1)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[1].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[1].name}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <View style={styles.rowView}>
          <TouchableHighlight
            style={this.state.relationNames[2].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 2)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[2].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[2].name}
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={this.state.relationNames[3].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 3)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[3].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[3].name}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <View style={styles.rowView}>
          <TouchableHighlight
            style={this.state.relationNames[4].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 4)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[4].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[4].name}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.rowView}>
          <TouchableHighlight
            style={this.state.relationNames[5].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 5)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[5].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[5].name}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <View style={styles.rowView}>
          <TouchableHighlight
            style={this.state.relationNames[6].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 6)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[6].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[6].name}
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={this.state.relationNames[7].renderStyle}
            onPress={this.handleSelectionChange.bind(this, 7)}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[7].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[7].name}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <DialogInput
          isDialogVisible={this.state.otherDialogVisible}
          title={"Please enter"}
          message={""}
          hintInput={""}
          multiline={true}
          numberOfLines={4}
          submitInput={inputText => {
            if (inputText.length > 0) {
              logger.info(
                codeFileName,
                "OtherRelationInputDialog",
                "Other relation entered:" + inputText
              );
              _selectedRelations = this.getSelectedRelations();
              _selectedRelations.add(inputText);
              logger.info(
                codeFileName,
                "OtherRelationInputDialog",
                "Invoking call back, selected relations:" +
                  Array.from(_selectedRelations)
              );
              this.props.relationSelectionHandler(_selectedRelations);

              this.setState({
                otherRelationName: inputText,
                otherDialogVisible: false
              });
            }
          }}
          closeDialog={() => {
            logger.info(
              codeFileName,
              "OtherRelationInputDialog",
              "Other relation (" + this.state.otherRelationName + ") removed."
            );

            _selectedRelations = this.getSelectedRelations();
            _selectedRelations.delete(this.state.otherRelationName);
            logger.info(
              codeFileName,
              "OtherRelationInputDialog",
              "Invoking call back, selected relations:" +
                Array.from(_selectedRelations)
            );
            this.props.relationSelectionHandler(_selectedRelations);

            //Un-select the UI option
            _relationNames = this.state.relationNames;
            _relationNames[_relationNames.length - 1].selected = false;
            _relationNames[_relationNames.length - 1].iconName =
              "checkbox-passive";

            this.setState({
              otherDialogVisible: false,
              relationNames: _relationNames,
              otherRelationName: ""
            });
          }}
        ></DialogInput>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  unselectedStyle: {
    backgroundColor: "white",
    padding: 2,
    margin: 2,
    borderWidth: 0.5
  },
  selectedStyle: {
    backgroundColor: "darkseagreen",
    padding: 2,
    margin: 2,
    borderWidth: 0.5
  },

  rowView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch"
  },
  itemTextStyle: {
    fontSize: 20
  }
});
