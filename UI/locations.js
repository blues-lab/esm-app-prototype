import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Fontisto";
import DialogInput from "react-native-dialog-input";
import logger from "../controllers/logger";
import * as strings from "../controllers/strings";

const codeFileName = "locations.js";

const styles = StyleSheet.create({
  unselectedStyle: {
    backgroundColor: "white",
    padding: 2,
    margin: 2,
    borderWidth: 1
  },
  selectedStyle: {
    backgroundColor: "#bfd9bf",
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
    fontSize: 18
  }
});

export default class Locations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      otherDialogVisible: false,
      locationNames: [
        {
          name: "Bedroom",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Living room",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Garden",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Kitchen",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Garage",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Bathroom",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        },
        {
          name: "Patio/balcony/terrace",
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
      ],
      otherLocationName: ""
    };
  }

  componentDidMount() {}

  handleSelectionChange(index) {
    this.setState(
      prevState => {
        const _locationNames = prevState.locationNames;
        _locationNames[index].selected = !_locationNames[index].selected;

        const _selected = _locationNames[index].selected;

        if (_selected) {
          _locationNames[index].iconName = "checkbox-active";
        } else {
          _locationNames[index].iconName = "checkbox-passive";
        }

        logger.info(
          `${codeFileName}`,
          "handleSelectionChange",
          `location: ${_locationNames[index].name}, selected: ${_locationNames[index].selected}`
        );

        return {
          locationNames: _locationNames,
          otherDialogVisible:
            _locationNames[index].name === "Other" && _selected
        };
      },
      () => {
        const _selectedLocations = this.getSelectedLocations();
        logger.info(
          codeFileName,
          "handleSelectionChange",
          "Invoking call back, selected locations:" +
            Array.from(_selectedLocations)
        );
        this.props.locationSelectionHandler(_selectedLocations);
      }
    );
  }

  getSelectedLocations() {
    const _locationNames = this.state.locationNames;
    const _selectedLocations = new Set([]);
    for (let i = 0; i < _locationNames.length; i++) {
      if (_locationNames[i].selected) {
        if (_locationNames[i].name !== "Other") {
          _selectedLocations.add(_locationNames[i].name);
        }
      }
    }
    return _selectedLocations;
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
          <TouchableOpacity
            style={this.state.locationNames[0].renderStyle}
            onPress={() => {
              this.handleSelectionChange(0);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[0].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[0].name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.locationNames[1].renderStyle}
            onPress={() => {
              this.handleSelectionChange(1);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[1].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[1].name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.locationNames[2].renderStyle}
            onPress={() => {
              this.handleSelectionChange(2);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[2].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[2].name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.locationNames[3].renderStyle}
            onPress={() => {
              this.handleSelectionChange(3);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[3].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[3].name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.locationNames[4].renderStyle}
            onPress={() => {
              this.handleSelectionChange(4);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[4].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[4].name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.locationNames[5].renderStyle}
            onPress={() => {
              this.handleSelectionChange(5);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[5].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[5].name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.locationNames[6].renderStyle}
            onPress={() => {
              this.handleSelectionChange(6);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[6].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[6].name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.locationNames[7].renderStyle}
            onPress={() => {
              this.handleSelectionChange(7);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.locationNames[7].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.locationNames[7].name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <DialogInput
          isDialogVisible={this.state.otherDialogVisible}
          title={strings.CONTEXT_WHERE_OTHER}
          message=""
          hintInput=""
          multiline
          numberOfLines={4}
          initValueTextInput={this.state.otherLocationName}
          submitText={strings.CONTEXT_WHERE_OTHER_SUBMIT}
          submitInput={inputText => {
            if (inputText.length > 0) {
              logger.info(
                codeFileName,
                "OtherLocationInputDialog",
                "Other location entered:" + inputText
              );
              const _selectedLocations = this.getSelectedLocations();
              _selectedLocations.add(inputText);
              logger.info(
                codeFileName,
                "OtherLocationInputDialog",
                "Invoking call back, selected locations:" +
                  Array.from(_selectedLocations)
              );
              this.props.locationSelectionHandler(_selectedLocations);

              this.setState({
                otherLocationName: inputText,
                otherDialogVisible: false
              });
            }
          }}
          closeDialog={() => {
            logger.info(
              codeFileName,
              "OtherLocationInputDialog",
              "Other location (" + this.state.otherLocationName + ") removed."
            );
            const _selectedLocations = this.getSelectedLocations();
            _selectedLocations.delete(this.state.otherLocationName);
            logger.info(
              codeFileName,
              "OtherLocationInputDialog",
              "Invoking call back, selected locations:" +
                Array.from(_selectedLocations)
            );
            this.props.locationSelectionHandler(_selectedLocations);

            //Un-select the UI option
            this.setState(prevState => {
              const _locationNames = prevState.locationNames;
              _locationNames[_locationNames.length - 1].selected = false;
              _locationNames[_locationNames.length - 1].iconName =
                "checkbox-passive";
              return {
                otherDialogVisible: false,
                otherLocationName: "",
                locationNames: _locationNames
              };
            });
          }}
        />
      </View>
    );
  }
}

Locations.propTypes = {
  locationSelectionHandler: PropTypes.func.isRequired
};
