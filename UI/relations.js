import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import DialogInput from "react-native-dialog-input";
import Icon from "react-native-vector-icons/Fontisto";
import logger from "../controllers/logger";
import * as strings from "../controllers/strings";

const codeFileName = "relations.js";

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

export default class Relations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      otherDialogVisible: false,
      otherRelationName: "",
      relationNames: [
        {
          name: "Other family members",
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
        },
        {
          name: "Partner/spouse/significant other",
          renderStyle: styles.unselectedStyle,
          iconName: "checkbox-passive",
          selected: false
        }
      ]
    };
  }

  componentDidMount() {}

  handleSelectionChange(index) {
    this.setState(
      prevState => {
        const _relationNames = prevState.relationNames;
        _relationNames[index].selected = !_relationNames[index].selected;
        const _selected = _relationNames[index].selected;
        if (_selected) {
          _relationNames[index].iconName = "checkbox-active";
        } else {
          _relationNames[index].iconName = "checkbox-passive";
        }

        logger.info(
          `${codeFileName}`,
          "handleSelectionChange",
          `relation: ${_relationNames[index].name}, selected: ${_relationNames[index].selected}`
        );

        return {
          relationNames: _relationNames,
          otherDialogVisible:
            _relationNames[index].name === "Other" && _selected
        };
      },
      () => {
        const _selectedRelations = this.getSelectedRelations();
        logger.info(
          codeFileName,
          "handleSelectionChange",
          "Invoking call back, selected relations:" +
            Array.from(_selectedRelations)
        );
        this.props.relationSelectionHandler(_selectedRelations);
      }
    );
  }

  getSelectedRelations() {
    const _relationNames = this.state.relationNames;
    const _selectedRelations = new Set([]);
    for (let i = 0; i < _relationNames.length; i++) {
      if (_relationNames[i].selected) {
        if (_relationNames[i].name !== "Other") {
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
          <TouchableOpacity
            style={this.state.relationNames[8].renderStyle}
            onPress={() => {
              this.handleSelectionChange(8);
            }}
          >
            <View style={styles.rowView}>
              <Icon
                name={this.state.relationNames[8].iconName}
                size={18}
                color="#66cc94"
                style={{ margin: 5 }}
              />
              <Text style={styles.itemTextStyle}>
                {this.state.relationNames[8].name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.relationNames[0].renderStyle}
            onPress={() => {
              this.handleSelectionChange(0);
            }}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.relationNames[1].renderStyle}
            onPress={() => {
              this.handleSelectionChange(1);
            }}
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
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.relationNames[2].renderStyle}
            onPress={() => {
              this.handleSelectionChange(2);
            }}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.relationNames[3].renderStyle}
            onPress={() => {
              this.handleSelectionChange(3);
            }}
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
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.relationNames[4].renderStyle}
            onPress={() => {
              this.handleSelectionChange(4);
            }}
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
          </TouchableOpacity>
        </View>
        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.relationNames[5].renderStyle}
            onPress={() => {
              this.handleSelectionChange(5);
            }}
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
          </TouchableOpacity>
        </View>

        <View style={styles.rowView}>
          <TouchableOpacity
            style={this.state.relationNames[6].renderStyle}
            onPress={() => {
              this.handleSelectionChange(6);
            }}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={this.state.relationNames[7].renderStyle}
            onPress={() => {
              this.handleSelectionChange(7);
            }}
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
          </TouchableOpacity>
        </View>

        <DialogInput
          isDialogVisible={this.state.otherDialogVisible}
          title={strings.CONTEXT_RELATE_OTHER}
          message=""
          hintInput=""
          multiline
          numberOfLines={4}
          submitInput={inputText => {
            if (inputText.length > 0) {
              logger.info(
                codeFileName,
                "OtherRelationInputDialog",
                "Other relation entered:" + inputText
              );
              const _selectedRelations = this.getSelectedRelations();
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

            const _selectedRelations = this.getSelectedRelations();
            _selectedRelations.delete(this.state.otherRelationName);
            logger.info(
              codeFileName,
              "OtherRelationInputDialog",
              "Invoking call back, selected relations:" +
                Array.from(_selectedRelations)
            );
            this.props.relationSelectionHandler(_selectedRelations);

            //Un-select the UI option
            this.setState(prevState => {
              const _relationNames = prevState.relationNames;
              _relationNames[_relationNames.length - 2].selected = false;
              _relationNames[_relationNames.length - 2].iconName =
                "checkbox-passive";
              return {
                otherDialogVisible: false,
                relationNames: _relationNames,
                otherRelationName: ""
              };
            });
          }}
        />
      </View>
    );
  }
}
Relations.propTypes = {
  relationSelectionHandler: PropTypes.func.isRequired
};
