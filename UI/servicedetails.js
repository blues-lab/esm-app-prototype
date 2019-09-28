import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  BackHandler
} from "react-native";
import PropTypes from "prop-types";
import DialogInput from "react-native-dialog-input";
import Icon from "react-native-vector-icons/Fontisto";
import logger from "../controllers/logger";
import commonStyles from "./Style";

const selectionText = "Selected (tap again to remove)";
const codeFileName = "serviceDetails.js";

const styles = StyleSheet.create({
  selectedItemStyle: {
    backgroundColor: "#9dd7fb",
    padding: 10,
    height: 60
  }
});

export default class ServiceDetailsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "",
      headerLeft: (
        <TouchableOpacity onPress={navigation.getParam("backHandler")}>
          <Text style={{ marginLeft: 5, fontSize: 22, color: "blue" }}>
            {"< Save and return"}
          </Text>
        </TouchableOpacity>
      )
    };
  };

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View
        style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
      />
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      serviceCategoryName: "", //contains the category name
      serviceNames: [], //contains parsed services
      isAddServiceDialogVisible: false,
      firstLoad: true //indicates whether the services are being loaded for the first time
    };
  }

  parseServiceNames(serviceCategory) {
    // load service names in array from service category object passed by parent
    const _serviceNames = [];
    const _services = serviceCategory.services;
    for (let i = 0; i < _services.length; i++) {
      _serviceNames.push({
        id: _services[i].name,
        name: _services[i].name,
        selected: _services[i].selected,
        description: _services[i].selected ? this.selectionText : "",
        renderStyle: commonStyles.listItemStyle
      });
    }

    if (this.state.firstLoad) {
      //_serviceNames = this.shuffle(_serviceNames);
      //this.setState
    }

    if (_serviceNames.length > 0) {
      _serviceNames.push(
        //Add 'Other'
        {
          id: "Other",
          name: "Other",
          selected: false,
          description: "",
          renderStyle: commonStyles.listItemStyle
        }
      );
    }

    return _serviceNames;
  }

  componentDidMount() {
    const { navigation } = this.props;
    const _serviceCategory = navigation.getParam(
      "serviceCategory",
      "NO-SERVICE"
    );

    this.props.navigation.setParams({
      backHandler: this.onBackButtonPress.bind(this)
    });

    this.setState(
      {
        serviceCategoryName: _serviceCategory.name,
        serviceNames: this.parseServiceNames(_serviceCategory)
      },
      () => {
        this.setState(prevState => ({
          isAddServiceDialogVisible: prevState.serviceNames.length === 0
        }));
      }
    );

    if (Platform.OS === "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPress.bind(this)
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPress
      );
    }
  }

  onBackButtonPress = () => {
    //this.handleBackNavigation();
    //Alert.alert("Back pressed!");
    this.props.navigation.goBack(null);
    return true;
  };

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  handleServiceSelection = async selectedServiceName => {
    await this.promisedSetState(prevState => {
      const _serviceNames = prevState.serviceNames;
      let _selectedService = null;
      for (let i = 0; i < _serviceNames.length; i++) {
        if (_serviceNames[i].name === selectedServiceName) {
          _serviceNames[i].selected = !_serviceNames[i].selected;

          if (_serviceNames[i].selected) {
            _serviceNames[i].description = selectionText;
            _serviceNames[i].renderStyle = styles.selectedItemStyle;
          } else {
            _serviceNames[i].description = "";
            _serviceNames[i].renderStyle = commonStyles.listItemStyle;
          }

          _selectedService = _serviceNames[i];
          break;
        }
      }

      //call parent component to update service selections
      this.props.navigation.state.params.serviceSelectionHandler(
        this.state.serviceCategoryName,
        _selectedService,
        false
      );

      logger.info(
        `${codeFileName}`,
        "handleServiceSelection",
        `Parameter:${selectedServiceName}.Services:${JSON.stringify(
          _serviceNames
        )}`
      );

      return {
        serviceNames: _serviceNames
      };
    });
  };

  renderListItem = ({ item }) => {
    if (item.id === "Other") {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ isAddServiceDialogVisible: true });
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              padding: 5,
              justifyContent: "flex-start"
            }}
          >
            {item.selected && (
              <Icon
                name="checkbox-active"
                size={20}
                color="#66cc94"
                style={{ margin: 5 }}
              />
            )}
            {!item.selected && (
              <Icon
                name="checkbox-passive"
                size={20}
                color="grey"
                style={{ margin: 5 }}
              />
            )}
            <Text style={{ flex: 1, flexWrap: "wrap", fontSize: 20 }}>
              {" "}
              {item.name}{" "}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={this.handleServiceSelection.bind(this, item.name)}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 5,
            justifyContent: "flex-start"
          }}
        >
          {item.selected && (
            <Icon
              name="checkbox-active"
              size={20}
              color="#66cc94"
              style={{ margin: 5 }}
            />
          )}
          {!item.selected && (
            <Icon
              name="checkbox-passive"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          <Text style={{ flex: 1, flexWrap: "wrap", fontSize: 20 }}>
            {" "}
            {item.name}{" "}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "stretch"
          }}
        >
          <View style={commonStyles.listContainerStyle}>
            <FlatList
              data={this.state.serviceNames}
              ItemSeparatorComponent={this.FlatListItemSeparator}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
              extraData={this.state}
            />
          </View>
        </View>

        <DialogInput
          isDialogVisible={this.state.isAddServiceDialogVisible}
          title="What other service?"
          message=""
          hintInput=""
          submitInput={async inputText => {
            if (inputText.length > 0) {
              const _newService = {
                id: inputText,
                name: inputText,
                selected: true,
                description: "",
                renderStyle: commonStyles.listItemStyle
              };

              logger.info(
                codeFileName,
                "DialogInput.NewService",
                `Newly added service name:${inputText}`
              );

              //call the callback function from the parent
              await this.props.navigation.state.params.newServiceHandler(
                this.state.serviceCategoryName,
                inputText
              );

              await this.promisedSetState(prevState => {
                const _serviceNames = prevState.serviceNames;
                _serviceNames.splice(_serviceNames.length - 1, 0, _newService);
                return {
                  serviceNames: _serviceNames,
                  isAddServiceDialogVisible: false
                };
              });
              if (this.state.serviceNames.length === 1) {
                //if the newly added service is the first one, go back to main menu
                this.props.navigation.goBack(null);
              }
            }
          }}
          closeDialog={() => {
            logger.info(
              `${codeFileName}`,
              "DialogInput.NewService.Close",
              "Canceled"
            );
            this.setState({ isAddServiceDialogVisible: false }, () => {
              if (this.state.serviceNames.length === 0) {
                //if no service, go back to main menu
                this.props.navigation.goBack(null);
              }
            });
          }}
        />
      </ScrollView>
    );
  }
}

ServiceDetailsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    state: PropTypes.shape({
      params: PropTypes.shape({
        newServiceHandler: PropTypes.function.isRequired,
        serviceSelectionHandler: PropTypes.function.isRequired
      })
    }).isRequired
  }).isRequired
};
