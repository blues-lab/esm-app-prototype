import React from "react";
import {
  Platform,
  Text,
  View,
  Button,
  ScrollView,
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  BackHandler
} from "react-native";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/Fontisto";
import { ProgressDialog } from "react-native-simple-dialogs";
import * as RNFS from "react-native-fs";
import Dialog from "react-native-dialog";
import DialogInput from "react-native-dialog-input";

import notificationController from "../controllers/notificationController";
import AppStatus from "../controllers/appStatus";
import commonStyles from "./Style";
import ToolBar from "./toolbar";
import * as strings from "../controllers/strings";
import logger from "../controllers/logger";
import * as utilities from "../controllers/utilities";
import {
  SELECTED_SERVICES_FILE,
  SERVICE_FILE_LOCAL,
  SURVEY_STATUS
} from "../controllers/constants";

const codeFileName = "servicemenu.js";

export default class ServiceMenuScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: (
        <ToolBar
          title="Service categories"
          progress={navigation.state.params.surveyProgress}
        />
      )
    };
  };

  openServiceDetailsPage(selectedServiceCategory) {
    //When clicked on a service category item, show the service-details page with the services
    // unless "No relevant service"/"None" was selected

    logger.info(
      "ServiceMenu",
      "OpenServiceDetailsPage",
      "Opening service category:" + selectedServiceCategory.name
    );

    if (selectedServiceCategory.id === "None") {
      this.setState({ noRelevantDialogVisible: true });
      return;
    }

    const _serviceCategories = this.state.serviceCategories;
    let _selectedIdx = 0;
    for (let i = 0; i < _serviceCategories.length; i++) {
      if (_serviceCategories[i].name === selectedServiceCategory.name) {
        _selectedIdx = i;
        break;
      }
    }

    logger.info(
      "ServiceMenu",
      "OpenServiceDetailsPage",
      "Navigating to service details for:" +
        selectedServiceCategory.name +
        ". " +
        JSON.stringify(_serviceCategories[_selectedIdx])
    );

    this.props.navigation.navigate("ServiceDetails", {
      serviceCategory: _serviceCategories[_selectedIdx],
      serviceSelectionHandler: this.handleServiceSelectionChange.bind(this),
      newServiceHandler: this.createNewService.bind(this)
    });
  }

  createNewService = async (categoryName, newServiceName) => {
    //create entry in the database when users enter a new service

    logger.info(
      codeFileName,
      "createNewService",
      "Category:" + categoryName + ", service:" + newServiceName
    );

    const _serviceCategoriesJS = this.state.serviceCategoriesJS;

    for (let i = 0; i < _serviceCategoriesJS.length; i++) {
      if (_serviceCategoriesJS[i].categoryName === categoryName) {
        _serviceCategoriesJS[i].services.push({
          serviceName: newServiceName,
          selected: true
        });
        break;
      }
    }

    await this.promisedSetState({ serviceCategoriesJS: _serviceCategoriesJS });
    await this.handleServiceSelectionChange(
      categoryName,
      { id: newServiceName, name: newServiceName, selected: true },
      true
    );
    await utilities.writeJSONFile(
      _serviceCategoriesJS,
      SERVICE_FILE_LOCAL,
      codeFileName,
      "createNewService"
    );
    await logger.info(
      codeFileName,
      "createNewService",
      "All selected services:" + JSON.stringify(this.getSelectedServices())
    );
  };

  async parseService(_fullJsonObj) {

  const funcName="parseService";
    //parse json data
    const _serviceCategoriesJS = _fullJsonObj;
    let _serviceCategories = [];

    let _otherServiceCategory=null;

    for (let i = 0; i < _serviceCategoriesJS.length; i++) {
      const _servicesJS = _serviceCategoriesJS[i].services;
      const _services = [];
      for (let j = 0; j < _servicesJS.length; j++) {
        _services.push({
          id: _servicesJS[j].serviceName,
          name: _servicesJS[j].serviceName,
          selected: false
        });
      }

      const _serviceEntry = {
                                id: _serviceCategoriesJS[i].categoryName,
                                name: _serviceCategoriesJS[i].categoryName,
                                selectedServiceNames: new Set([]),
                                renderStyle: commonStyles.listItemStyle,
                                services: _services
                             }

      if(_serviceCategoriesJS[i].categoryName !== 'Other')
      {
        _serviceCategories.push(_serviceEntry);
      }
      else
      {
        _otherServiceCategory = _serviceEntry; // separately store 'Other' category so that it can be added as the last item.
      }
    }

    await logger.info(
      "ServiceMenu",
      "parseService",
      "Number of categories found:" + _serviceCategories.length + "."
    );

    if (this.state.firstLoad) {
      //only shuffle and add these items at the first time
      logger.info(
        codeFileName,
        "parseService",
        "First time loading. Shuffling service categories."
      );
      _serviceCategories = utilities.shuffleArray(_serviceCategories);
      if(_otherServiceCategory !== null)
      {
        _serviceCategories.push(_otherServiceCategory);
      }
      else
      {
        logger.error(codeFileName, funcName, "'Other' service category not found!");
      }

      _serviceCategories.push(
        //Add 'No relevant service'
        {
          id: "None",
          name: "No relevant service",
          selectedServiceNames: new Set([]),
          renderStyle: commonStyles.listItemStyle,
          services: []
        }
      );
    }

    this.setState({
      serviceCategoriesJS: _fullJsonObj,
      serviceCategories: _serviceCategories,
      firstLoad: false
    });
  }

  handleServiceSelectionChange = async (
    categoryName,
    service,
    isNewService
  ) => {
    //Callback function sent to the service details page, and called when a service is selected.
    logger.info(
      "ServiceMenu",
      "handleServiceSelectionChange",
      "Category:" + categoryName + ", service:" + service.name,
      ", selected:" + service.selected
    );
    const _serviceCategories = this.state.serviceCategories;
    for (let i = 0; i < _serviceCategories.length; i++) {
      if (_serviceCategories[i].name === categoryName) {
        //add service to the selected list
        if (service.selected) {
          _serviceCategories[i].selectedServiceNames.add(service.name);
        } else {
          _serviceCategories[i].selectedServiceNames.delete(service.name);
        }

        //if existing service, mark it as selected, or create a new entry
        if (!isNewService) {
          const _services = _serviceCategories[i].services;
          for (let j = 0; j < _services.length; j++) {
            if (_services[j].name === service.name) {
              _services[j].selected = service.selected;
            }
          }
        } else {
          _serviceCategories[i].services.push(service);
        }
      }
    }

    await this.promisedSetState({ serviceCategories: _serviceCategories });
    // await logger.info(codeFileName, 'handleServiceSelectionChange', 'All selected services:'+JSON.stringify(this.getSelectedServices()));
  };

  getSelectedServices() {
    //Convert selected services in JSON format
    const _selectedServicesJS = [];
    const _serviceCategories = this.state.serviceCategories;
    for (let i = 0; i < _serviceCategories.length; i++) {
      if (_serviceCategories[i].selectedServiceNames.size > 0) {
        _selectedServicesJS.push({
          category: _serviceCategories[i].name,
          services: Array.from(_serviceCategories[i].selectedServiceNames)
        });
      }
    }
    return _selectedServicesJS;
  }

  loadServices() {
    RNFS.readFile(SERVICE_FILE_LOCAL)
      .then(_fileContent => {
        logger.info(
          "ServiceMenu",
          "ReadServiceFile",
          "Successfully read:" + SERVICE_FILE_LOCAL
        );
        const _fullJsonObj = JSON.parse(_fileContent);
        this.parseService(_fullJsonObj);
      })
      .catch(err => {
        logger.info(
          "ServiceMenu",
          "ReadServiceFile",
          "Failed to read:" + SERVICE_FILE_LOCAL + ". Err:" + err.message
        );
      });
  }

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  constructor(props) {
    super(props);

    this.state = {
      serviceCategoriesJS: "", //JSON object loaded from file and then parsed
      serviceCategories: [], //Parsed service categories in an array
      newCategoryDialogVisible: false,
      noRelevantDialogVisible: false,
      noRelevantServiceReason: "",
      surveyResponseJS: {}, //Hold participants responses
      firstLoad: true, //indicates whether the services are being loaded for the first time
      saveWaitVisible: false //show progress dialog while saving survey response
    };
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");
    const { navigation } = this.props;
    const _topic = navigation.getParam("conversationTopic", "");

    await this.promisedSetState(prevState => {
      const _surveyResponseJS = prevState.surveyResponseJS;
      _surveyResponseJS.conversationTopic = _topic;
      return {
        surveyResponseJS: _surveyResponseJS,
        surveyProgress: navigation.getParam("surveyProgress", 0)
      };
    });

    await this.loadServices();
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "ServiceMenu") {
      logger.info(
        codeFileName,
        "onBackButtonPressAndroid",
        "Preventing to go back."
      );
      return true; //make it true to prevent going back
    }

    logger.error(
      codeFileName,
      "onBackButtonPressAndroid",
      "This should not be the event handler for page: " +
        this.props.navigation.state.routeName
    );
    return false;
  };

  flatListItemSeparator = () => {
    return (
      <View style={{ height: 0.5, width: "100%", backgroundColor: "grey" }} />
    );
  };

  clearServiceSelections() {
    //clears all selected services if 'No relevant service' selected
    logger.info(
      codeFileName,
      "clearServiceSelections",
      "Clearing all selected services."
    );

    this.setState(prevState => {
      const _serviceCategories = prevState.serviceCategories;
      for (let i = 0; i < _serviceCategories.length; i++) {
        _serviceCategories[i].selectedServiceNames.clear();
      }
      return {
        serviceCategories: _serviceCategories
      };
    });
  }

  static async fileUploadCallBack(success, error = null, data = null) {
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload partial response, error: ${error}. Stage:Services selected. Saving in file: ${data !=
          null}`
      );
      if (data != null) {
        const _saved = await utilities.writeJSONFile(
          data,
          RNFS.DocumentDirectoryPath +
            "/partial-survey--response--" +
            Date.now().toString() +
            ".js",
          codeFileName,
          "fileUploadCallBack"
        );
      }
    }
  }

  async expireSurvey(_appStatus) {
    const funcName = "expireSurvey";
    const _newStatus = _appStatus;
    _newStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    _newStatus.CurrentSurveyID = null;
    await AppStatus.setAppStatus(_newStatus, codeFileName, funcName);

    await logger.info(
      codeFileName,
      funcName,
      "Survey expired, going back to home from " +
        this.props.navigation.state.routeName
    );

    notificationController.cancelNotifications();
    this.props.navigation.navigate("Home");

    Alert.alert(strings.SURVEY_EXPIRED_HEADER, strings.SURVEY_EXPIRED);
  }

  async showPermissionPage() {
    const funcName = "showPermissionPage";
    const _appStatus = await AppStatus.getStatus(codeFileName, funcName);
    if (await utilities.currentSurveyExpired(_appStatus)) {
      await this.expireSurvey(_appStatus);
      return;
    }

    //After service selection is done, show permission page for at most 3 selected services
    let _services = [];
    for (let i = 0; i < this.state.serviceCategories.length; i++) {
      const _selectedServiceNames = Array.from(
        this.state.serviceCategories[i].selectedServiceNames
      );
      for (let j = 0; j < _selectedServiceNames.length; j++) {
        _services.push({
          categoryName: this.state.serviceCategories[i].name,
          serviceName: _selectedServiceNames[j]
        });
      }
    }

    if (_services.length === 0) {
      Alert.alert("Please select at least one service to continue.");
      logger.info(
        codeFileName,
        "showPermissionPage",
        "No service selected to show permission page. Returning."
      );
      return;
    }

    //logger.info(codeFileName, 'showPermissionPage','Total number of services selected:'+_services.length);

    //randomly select 3 permission pages
    _services = utilities.shuffleArray(_services);
    _services = _services.slice(0, 3);

    const _selectedServices = this.getSelectedServices();
    logger.info(
      codeFileName,
      "showPermissionPage",
      "Saving selected services to use in the exit survey."
    );

    try {
      if (await !RNFS.exists(SELECTED_SERVICES_FILE)) {
        await RNFS.writeFile(
          SELECTED_SERVICES_FILE,
          JSON.stringify(_selectedServices) + "\n"
        );
      } else {
        RNFS.appendFile(
          SELECTED_SERVICES_FILE,
          JSON.stringify(_selectedServices) + "\n"
        );
      }
    } catch (error) {
      logger.error(
        codeFileName,
        "showPermissionPage",
        "Failed to save selected services: " + error.message
      );
    }

    logger.info(
      codeFileName,
      "showPermissionPage",
      "Uploading partial response."
    );
    //upload partial survey response
    {
      await this.promisedSetState({ saveWaitVisible: true });
      const _surveyResponseJS = this.state.surveyResponseJS;
      _surveyResponseJS.SelectedServices = _selectedServices;

      utilities.uploadData(
        {
          SurveyID: _appStatus.CurrentSurveyID,
          Stage: "Services selected.",
          PartialResponse: _surveyResponseJS
        },
        _appStatus.UUID,
        "PartialSurveyResponse",
        codeFileName,
        "showPermissionPage",
        ServiceMenuScreen.fileUploadCallBack
      );

      logger.info(
        codeFileName,
        "showPermissionPage",
        "Navigating to permission page."
      );
      await this.promisedSetState({
        saveWaitVisible: false,
        surveyResponseJS: _surveyResponseJS,
        surveyProgress: 40
      });
    }

    this.props.navigation.navigate("ServicePermission", {
      services: _services,
      surveyResponseJS: this.state.surveyResponseJS,
      surveyProgress: this.state.surveyProgress
    });
  }

  renderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender" }}
        onPress={() => {
          this.openServiceDetailsPage(item);
        }}
      >
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              padding: 2,
              justifyContent: "flex-start"
            }}
          >
            {item.id !== "None" && item.selectedServiceNames.size === 0 && (
              <Icon
                name="checkbox-passive"
                size={20}
                color="grey"
                style={{ margin: 5 }}
              />
            )}
            {item.id !== "None" && item.selectedServiceNames.size > 0 && (
              <Icon
                name="checkbox-active"
                size={20}
                color="#66cc94"
                style={{ margin: 5 }}
              />
            )}
            {item.id === "None" && (
              <Icon
                name="radio-btn-passive"
                size={20}
                color="grey"
                style={{ margin: 5 }}
              />
            )}
            <Text style={{ fontSize: 20 }}> {item.name} </Text>
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 14,
              fontStyle: "italic",
              padding: 2,
              marginLeft: 10,
              marginRight: 5
            }}
          >
            {Array.from(item.selectedServiceNames).toString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        <NavigationEvents
          onDidFocus={payload => {
            if (Platform.OS === "android") {
              logger.info(
                codeFileName,
                "onDidFocus",
                "Adding back button event handler. Payload: " +
                  JSON.stringify(payload)
              );
              BackHandler.addEventListener(
                "hardwareBackPress",
                this.onBackButtonPressAndroid
              );
            }
          }}
          onWillBlur={payload => {
            if (Platform.OS === "android") {
              logger.info(
                codeFileName,
                "onWillBlur",
                "Removing back button event handler. Payload: " +
                  JSON.stringify(payload)
              );
              BackHandler.removeEventListener(
                "hardwareBackPress",
                this.onBackButtonPressAndroid
              );
            }
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "stretch",
            margin: 5
          }}
        >
          <Text style={commonStyles.questionStyle}>
            {strings.SELECT_RELEVANT_SERVICES}
          </Text>

          <View style={commonStyles.listContainerStyle}>
            <FlatList
              data={this.state.serviceCategories}
              ItemSeparatorComponent={this.flatListItemSeparator}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
              extraData={this.state}
            />
          </View>
        </View>

        <View style={commonStyles.buttonViewStyle}>
          <TouchableHighlight style={commonStyles.buttonTouchHLStyle}>
            <Button
              title={strings.NEXT_BUTTON}
              color="#20B2AA"
              onPress={async () => {
                await this.showPermissionPage();
              }}
            />
          </TouchableHighlight>
        </View>

        <DialogInput
          isDialogVisible={this.state.newCategoryDialogVisible}
          title={strings.OTHER_SERVICE_PROMPT}
          message=""
          hintInput=""
          multiline
          numberOfLines={4}
          submitInput={inputText => {
            logger.info(
              "ServiceMenu",
              "DialogInput.Submit",
              "Adding new service category: " + inputText
            );

            this.setState(prevState => {
              const _serviceCategories = prevState.serviceCategories;
              _serviceCategories.push({
                id: inputText,
                name: inputText,
                selectedServiceNames: new Set([]),
                renderStyle: commonStyles.listItemStyle,
                services: []
              });
              return {
                serviceCategories: _serviceCategories,
                newCategoryDialogVisible: false
              };
            });
          }}
          closeDialog={() => {
            this.setState({ newCategoryDialogVisible: false });
          }}
        />

        <Dialog.Container visible={this.state.noRelevantDialogVisible}>
          <Dialog.Title>{strings.WHY_NO_RELEVANT}</Dialog.Title>
          <Dialog.Input
            multiline
            numberOfLines={4}
            style={{ height: 300, borderColor: "lightgray", borderWidth: 1 }}
            value={this.state.noRelevantServiceReason}
            onChangeText={reason => {
              this.setState({ noRelevantServiceReason: reason });
            }}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => {
              this.setState(prevState => {
                const _reason =
                  prevState.surveyResponseJS.noRelevantServiceReason;
                return {
                  noRelevantDialogVisible: false,
                  noRelevantServiceReason: _reason
                };
              });
            }}
          />
          <Dialog.Button
            label={strings.NEXT_BUTTON}
            onPress={async () => {
              this.clearServiceSelections();
              logger.info(
                "ServiceMenu",
                "DialogInput.Submit",
                "Reason for no relevant service: " +
                  this.state.noRelevantServiceReason
              );

              await this.promisedSetState(prevState => {
                const _surveyResponseJS = prevState.surveyResponseJS;
                _surveyResponseJS.noRelevantServiceReason =
                  prevState.noRelevantServiceReason;

                return {
                  noRelevantDialogVisible: false,
                  surveyResponseJS: _surveyResponseJS
                };
              });

              if (
                this.state.surveyResponseJS.noRelevantServiceReason.length > 0
              ) {
                //upload partial survey response
                {
                  this.setState({ saveWaitVisible: true });
                  const _appStatus = await AppStatus.getStatus(
                    codeFileName,
                    "NoRelevantService.SaveButton.onPress"
                  );
                  logger.info(
                    codeFileName,
                    "NoRelevantService.SaveButton.onPress",
                    "Uploading partial response."
                  );

                  utilities.uploadData(
                    {
                      SurveyID: _appStatus.CurrentSurveyID,
                      Stage: "No relevant service selected.",
                      PartialResponse: this.state.surveyResponseJS
                    },
                    _appStatus.UUID,
                    "PartialSurveyResponse",
                    codeFileName,
                    "NextButtonPress",
                    ServiceMenuScreen.fileUploadCallBack
                  );

                  this.setState({ saveWaitVisible: false });
                }

                logger.info(
                  codeFileName,
                  "NextButtonPress",
                  "Navigating to servicePermission page."
                );
                //                this.props.navigation.navigate("ContextualQuestion", {
                //                  surveyResponseJS: this.state.surveyResponseJS,
                //                  surveyProgress: 80
                //                });
                this.props.navigation.navigate("ServicePermission", {
                  services: null,
                  surveyResponseJS: this.state.surveyResponseJS,
                  surveyProgress: 75
                });
              }
            }}
          />
        </Dialog.Container>

        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title={strings.SAVING_HEADER}
          message={strings.SAVING_WAIT}
        />
      </ScrollView>
    );
  }

  componentWillUnmount() {
    logger.info(codeFileName, "componentDidMount", "Unmounting components.");
  }
}

ServiceMenuScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired
  }).isRequired
};
