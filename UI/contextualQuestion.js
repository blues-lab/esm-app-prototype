import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  ScrollView,
  TouchableHighlight,
  Switch,
  BackHandler
} from "react-native";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import * as RNFS from "react-native-fs";
import { ProgressDialog } from "react-native-simple-dialogs";
import CustomNumericInput from "./customNumericInput";
import commonStyle from "./Style";
import logger from "../controllers/logger";
import appStatus from "../controllers/appStatus";
import notificationController from "../controllers/notificationController";
import Locations from "./locations";
import Relations from "./relations";
import * as utilities from "../controllers/utilities";
import { SURVEY_STATUS } from "../controllers/constants";
import ToolBar from "./toolbar";
import * as strings from "../controllers/strings";

const codeFileName = "contextualQuestion.js";

const styles = StyleSheet.create({
  verticalViewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center"
    //    marginRight:10,
    //    marginLeft:10,
    //backgroundColor:'lightcyan',
  },

  insideVerticalViewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
    //backgroundColor:'#a7f1e9'
  },

  horizontalViewStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
    //      marginRight:10,
    //      marginLeft:10,
    ///backgroundColor:'lightcyan',
  }
});

export default class ContextualQuestionScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: (
        <ToolBar
          title="Contextual questions"
          progress={navigation.state.params.surveyProgress}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      numOfPeople: 1,
      selectedRelations: new Set([]),
      selectedLocations: new Set([]),
      numOfPeopleCanHear: 0,
      childrenPresent: false,
      adolescentPresent: false,
      remoteConversation: true,
      surveyResponseJS: {}, //whole survey response passed by parent
      surrounding: false, //Questions about surrounding people VS participating people
      saveWaitVisible: false //show progress dialog while saving survey response
    };
  }

  componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");
    const { navigation } = this.props;
    const _surveyResponseJS = navigation.getParam("surveyResponseJS", null);

    this.setState({
      surveyResponseJS: _surveyResponseJS,
      surveyProgress: navigation.getParam("surveyProgress", 0)
    });
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "ContextualQuestion") {
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

  componentWillUnmount() {
    logger.info(codeFileName, "componentWillUnmount", "Unmounting components.");
  }

  relationSelectionHandler = selectedRelations => {
    this.setState({ selectedRelations });
    logger.info(
      codeFileName,
      "relationSelectionHandler",
      "Currently selected relations:" + Array.from(selectedRelations)
    );
  };

  locationSelectionHandler = selectedLocations => {
    this.setState({ selectedLocations });
    logger.info(
      codeFileName,
      "locationSelectionHandler",
      "Currently selected locations:" + Array.from(selectedLocations)
    );
  };

  async saveResponse() {
    this.setState({ saveWaitVisible: true });

    const _appStatus = await appStatus.loadStatus();

    const _contextResponseJS = {
      NumOfPeopleAround: this.state.numOfPeople,
      NumOfPeopleCanHear: this.state.numOfPeopleCanHear,
      ChildrenPresent: this.state.childrenPresent,
      AdolescentPresent: this.state.adolescentPresent,
      RemoteConversation: this.state.remoteConversation,
      Relations: Array.from(this.state.selectedRelations).toString(),
      Locations: Array.from(this.state.selectedLocations).toString(),
      SurveyCountToday: _appStatus.SurveyCountToday,
      CurrentSurveyCreationTime: _appStatus.FirstNotificationTime,
      CurrentSurveyCompletionTime: new Date(),
      UIID: _appStatus.UIID
    };

    const _surveyResponseJS = this.state.surveyResponseJS;
    _surveyResponseJS.ContextualQuestionResponses = _contextResponseJS;

    logger.info(
      codeFileName,
      "saveResponse",
      "Uploading survey response to the server."
    );

    const _uploaded = await utilities.uploadData(
      {
        SurveyID: _appStatus.CurrentSurveyID,
        Stage: "Completed.",
        Response: _surveyResponseJS
      },
      _appStatus.UUID,
      "SurveyResponse",
      codeFileName,
      "saveResponse"
    );
    if (_uploaded) {
      logger.info(
        codeFileName,
        "saveResponse",
        "Uploading survey response done!"
      );
    } else {
      logger.error(
        codeFileName,
        "saveResponse",
        "Failed to upload response. Saving in local file for now."
      );
      const _time = Date.now().toString();
      const _saved = await utilities.writeJSONFile(
        _surveyResponseJS,
        RNFS.DocumentDirectoryPath + "/survey--response--" + _time + ".js",
        codeFileName,
        "saveResponse"
      );

      if (!_saved) {
        Alert.alert(
          strings.ERROR_MESSAGE_HEADER,
          strings.SAVING_ERROR_MESSAGE,
          [
            {
              text: strings.SEND_ERROR_EMAIL,
              onPress: async () => {
                const _body = await utilities.gatherErrorData(
                  codeFileName,
                  "fileUploadCallBack"
                );
                utilities.sendEmail(
                  [strings.CONTACT_EMAIL],
                  "Error saving full survey response. Page: " + codeFileName,
                  JSON.stringify(_body)
                );
              }
            },
            {
              text: "Cancel"
            }
          ],
          { cancelable: false }
        );
      }
    }

    logger.info(
      codeFileName,
      "saveResponse",
      "Updating app status and cancelling all notifications."
    );
    _appStatus.CompletedSurveys += 1;
    _appStatus.SurveysAnsweredToday += 1;
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    _appStatus.CurrentSurveyID = null;
    await appStatus.setAppStatus(_appStatus);
    notificationController.cancelNotifications();

    this.setState({ saveWaitVisible: false }, () => {
      Alert.alert(
        strings.SURVEY_DONE_HEADER,
        _appStatus.EligibleForBonus
          ? strings.SURVEY_DONE_BONUS
          : strings.SURVEY_DONE_NO_BONUS,
        [
          {
            text: "OK",
            onPress: () => {
              BackHandler.exitApp();
            }
          }
        ],
        { cancelable: false }
      );
    });
  }

  numPeopleAroundChangeHandler = value => {
    this.setState({ numOfPeople: value });
  };

  numPeopleCanHearChangeHandler = value => {
    this.setState({ numOfPeopleCanHear: value });
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
        <View style={{ margin: 10 }}>
          <View style={styles.verticalViewStyle}>
            {this.state.surrounding && (
              <View style={styles.verticalViewStyle}>
                <View style={styles.insideVerticalViewStyle}>
                  <View style={commonStyle.dividerStyle}>
                    <Text style={commonStyle.questionStyle}>
                      {strings.CONTEXT_COULD_HEAR}
                    </Text>
                    <CustomNumericInput
                      valueChangeCallback={this.numPeopleCanHearChangeHandler}
                    />
                  </View>
                </View>

                <View style={commonStyle.dividerStyle}>
                  <Text style={[commonStyle.questionStyle]}>
                    <Text>{strings.CONTEXT_WHERE}</Text>
                    <Text>{"\n"}</Text>
                    <Text>{strings.CONTEXT_WHERE_SELECT_ALL}</Text>
                  </Text>
                  <Locations
                    locationSelectionHandler={this.locationSelectionHandler}
                  />
                </View>
              </View>
            )}

            {!this.state.surrounding && (
              <View style={styles.verticalViewStyle}>
                <Text style={[commonStyle.questionStyle]}>
                  {strings.CONTEXT_INTRO}
                </Text>
                <View style={commonStyle.dividerStyle}>
                  <Text style={commonStyle.questionStyle}>
                    {strings.CONTEXT_HOW_MANY_TALKING}
                  </Text>
                  <CustomNumericInput
                    valueChangeCallback={this.numPeopleAroundChangeHandler}
                    minValue={1}
                  />
                </View>

                {this.state.numOfPeople > 0 && (
                  <View style={styles.verticalViewStyle}>
                    <View style={commonStyle.dividerStyle}>
                      <Text style={commonStyle.questionStyle}>
                        {strings.CONTEXT_RELATE}
                      </Text>
                      <Relations
                        relationSelectionHandler={this.relationSelectionHandler}
                      />
                    </View>

                    <View style={commonStyle.dividerStyle}>
                      <Text style={commonStyle.questionStyle}>
                        {strings.CHILDREN_ADOLESCENT[0]}
                      </Text>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <Text style={{ margin: 10, fontSize: 18 }}>
                          {" "}
                          {strings.CHILDREN_ADOLESCENT[1]}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginRight: 20
                          }}
                        >
                          <Switch
                            style={{ marginLeft: 10 }}
                            value={this.state.childrenPresent}
                            onValueChange={val =>
                              this.setState({ childrenPresent: val })
                            }
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <Text style={{ margin: 10, fontSize: 18 }}>
                          {" "}
                          {strings.CHILDREN_ADOLESCENT[2]}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginRight: 20
                          }}
                        >
                          <Switch
                            style={{ marginLeft: 10 }}
                            value={this.state.adolescentPresent}
                            onValueChange={val =>
                              this.setState({ adolescentPresent: val })
                            }
                          />
                        </View>
                      </View>
                    </View>

                    <View style={commonStyle.dividerStyle}>
                      <Text style={commonStyle.questionStyle}>
                        {strings.CONTEXT_PRESENT}
                      </Text>
                      <View style={styles.horizontalViewStyle}>
                        <Text style={{ margin: 10, fontSize: 18 }}>No</Text>
                        <Switch
                          style={{ marginLeft: 10 }}
                          value={this.state.remoteConversation}
                          onValueChange={val =>
                            this.setState({ remoteConversation: val })
                          }
                        />
                        <Text style={{ margin: 10, fontSize: 18 }}>Yes</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={[commonStyle.buttonViewStyle, { marginTop: 20 }]}>
            <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
              <Button
                onPress={() => {
                  if (this.state.surrounding) {
                    if (this.state.selectedLocations.size === 0) {
                      Alert.alert("Error", strings.NO_LOCATION_SELECTED_ERROR);
                      logger.warn(
                        codeFileName,
                        "NextButtonPress",
                        "No location has been selected, showing error."
                      );
                      return;
                    }
                    this.setState({ surveyProgress: 100 });
                    this.props.navigation.setParams({ surveyProgress: 100 });
                    this.saveResponse();
                  } else {
                    if (this.state.selectedRelations.size === 0) {
                      Alert.alert("Error", strings.NO_RELATION_SELECTED_ERROR);
                      logger.warn(
                        codeFileName,
                        "NextButtonPress",
                        "No relation has been selected, showing error."
                      );
                      return;
                    }
                    this.setState({ surrounding: true, surveyProgress: 90 });
                    this.props.navigation.setParams({ surveyProgress: 90 });
                  }
                }}
                title="Next"
                color="#20B2AA"
                accessibilityLabel="Save"
              />
            </TouchableHighlight>
          </View>
        </View>

        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title={strings.SAVING_HEADER}
          message={strings.SAVING_WAIT}
        />
      </ScrollView>
    );
  }
}

ContextualQuestionScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
};
