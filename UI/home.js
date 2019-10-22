import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TouchableHighlight,
  BackHandler,
  ScrollView
} from "react-native";
import { NavigationEvents } from "react-navigation";
import * as RNFS from "react-native-fs";
import UUIDGenerator from "react-native-uuid-generator";
import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import * as Sentry from "@sentry/react-native";

import DialogInput from "./vendor/DialogInput";
import notificationController, {
  onAppOpen
} from "../controllers/notificationController";
import logger from "../controllers/logger";
import AppStatus from "../controllers/appStatus";
import * as strings from "../controllers/strings";
import commonStyles from "./Style";
import ToolBar from "./toolbar";
import * as utilities from "../controllers/utilities";
import {
  USER_SETTINGS_FILE_PATH,
  INVITATION_CODE_FILE_PATH,
  SURVEY_STATUS
} from "../controllers/constants";

const codeFileName = "home.js";

/**
 * Return true if the invitation code is a debug code
 *
 * Debug codes start with a period
 * @param {string} codeString
 */
function isDebugCode(codeString) {
  return codeString.charAt(0) === ".";
}

/**
 * Return true if the invitation code is valid
 *
 * In a valid invitation code, the last digit equals the sum of the remaining digits, mod 10.
 * All valid invitation codes are also greater than 1000.
 *
 * @param {string} codeString
 */
function isValidInvitationCode(codeString) {
  const code = parseInt(codeString, 10);
  if (Number.isNaN(code)) {
    return false;
  }

  if (code < 1000) {
    return false;
  }

  const checkDigit = code % 10;
  let sum = 0;

  let num = Math.floor(code / 10);
  while (num > 10) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  sum += num % 10;

  const checkValue = sum % 10;

  return checkDigit === checkValue;
}

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: (
        <ToolBar
          title="Home"
          progress={0}
          showProgress={false}
          backCallBack={navigation.getParam("backCallBack")}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      invitationCodePrompt: strings.ENTER_INVITE_CODE,
      invitationCodeDialogVisible: false,
      invitationCode: "",
      noSurveyDialogVisible: true,
      studyPeriodEnded: false,
      exitSurveyDone: false,
      exitSurveyAvailable: false,
      invitationCodeObtained: false,
      ExitSurveyRemainingDays: 0,
      canUninstallApp: false,
      locationEnabled: false
    };

    this.onAppOpen = this.initApp.bind(this);
  }

  isFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem("@HAS_LAUNCHED");
      return value;
    } catch (e) {
      // error reading value
    }
    return null;
  };

  static fileUploadCallBack(success, error = null, data = null) {
    //need to move this function in utility
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload file, error: ${error}. Stage: Ask for conversation. Saving in file: ${data !=
          null}`
      );
      if (data != null) {
        utilities.writeJSONFile(
          data,
          RNFS.DocumentDirectoryPath +
            "/survey--status--changed--" +
            Date.now().toString() +
            ".js",
          codeFileName,
          "fileUploadCallBack"
        );
      }
    }
  }

  async hadConversationYes() {
    const _surveyID = "SurveyID-" + Date.now();
    logger.info(
      `${codeFileName}`,
      "hadConversationYes",
      "Starting new survey with id: " + _surveyID
    );

    const _appStatus = await AppStatus.getStatus();
    _appStatus.CurrentSurveyID = _surveyID;
    _appStatus.SurveyStatus = SURVEY_STATUS.ONGOING;

    logger.info(
      codeFileName,
      "hadConversationYes",
      "Updating app status and navigating to startSurvey."
    );

    utilities.uploadData(
      {
        Stage: "Recent conversation.",
        SurveyStatus: "Survey accepted.",
        SurveyID: _surveyID,
        Time: new Date()
      },
      _appStatus.UUID,
      "SurveyStatusChanged",
      codeFileName,
      "startSurvey",
      HomeScreen.fileUploadCallBack
    );

    await AppStatus.setAppStatus(
      _appStatus,
      codeFileName,
      "hadConversationYes"
    );
    notificationController.cancelNotifications();
    this.props.navigation.navigate("StartSurvey");
  }

  async hadConversationNo() {
    logger.info(
      `${codeFileName}`,
      "'No' to recent conversation",
      "Uploading response and updating app status."
    );

    const _appStatus = await AppStatus.getStatus();
    utilities.uploadData(
      {
        Stage: "Recent conversation.",
        SurveyStatus: "Survey declined.",
        Time: new Date()
      },
      _appStatus.UUID,
      "SurveyStatusChanged",
      codeFileName,
      "startSurvey",
      HomeScreen.fileUploadCallBack
    );

    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    await AppStatus.setAppStatus(_appStatus, codeFileName, "hadConversationNo");
    notificationController.cancelNotifications();
    this.initApp();

    Alert.alert(strings.NO_CONVERSATION_HEADER, strings.NO_CONVERSATION);
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "Home") {
      logger.info(codeFileName, "onBackButtonPressAndroid", "Exiting app.");
      BackHandler.exitApp();
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

  initApp = async () => {
    if (this.props.navigation.state.routeName === "Home") {
      logger.info(
        codeFileName,
        "initApp",
        "Registering to listen app foreground/background transition"
      );

      logger.info(codeFileName, "initApp", "Reloading app status.");
      const _appStatus = await AppStatus.getStatus();
      logger.info(
        codeFileName,
        "initApp",
        "Current app status:" + JSON.stringify(_appStatus)
      );

      if (_appStatus.InstallationDate === null) {
        //first launch
        logger.info(
          codeFileName,
          "initApp",
          "First time app launch. Getting invitation code."
        );
        this.setState({
          noSurveyDialogVisible: true,
          invitationCodeDialogVisible: true
        });
      } //not first launch
      else {
        logger.info(codeFileName, "initApp", "Nth time app launch");

        //Check if study period has ended

        if (utilities.surveyPeriodEnded(_appStatus)) {
          const _remainingDays = utilities.exitSurveyAvailableDays(_appStatus);
          logger.info(
            codeFileName,
            "initApp",
            "ESM period ended. Exit survey done? " +
              _appStatus.ExitSurveyDone +
              ". Exit survey remaining days: " +
              _remainingDays
          );

          this.setState({
            studyPeriodEnded: true,
            exitSurveyDone: _appStatus.ExitSurveyDone,
            exitSurveyAvailable:
              !_appStatus.ExitSurveyDone && _remainingDays > 0,
            canUninstallApp: !_appStatus.ExitSurveyDone && _remainingDays < 7,
            noSurveyDialogVisible: false,
            ExitSurveyRemainingDays: _remainingDays
          });
          return;
        }

        logger.info(codeFileName, "initApp", "Still in study period.");

        //still in study period, check wifi status and if there is any survey
        try {
          if (await RNFS.exists(USER_SETTINGS_FILE_PATH)) {
            const _fileContent = await RNFS.readFile(USER_SETTINGS_FILE_PATH);
            const _userSettingsData = JSON.parse(_fileContent);
            logger.info(codeFileName, "initApp", "Read user settings.");

            //Check if home wifi is set
            if (_userSettingsData.homeWifi.length === 0) {
              logger.info(
                codeFileName,
                "initApp",
                "Home Wifi not set. Navigating to settings page."
              );
              this.props.navigation.navigate("UserSettings");
            } else if (
              _appStatus.SurveyStatus === SURVEY_STATUS.AVAILABLE ||
              _appStatus.SurveyStatus === SURVEY_STATUS.ONGOING
            ) {
              logger.info(
                codeFileName,
                "initApp",
                "_appStatus.SurveyStatus is " +
                  _appStatus.SurveyStatus +
                  ". Checking if survey was expired."
              );

              if (!(await utilities.currentSurveyExpired(_appStatus))) {
                logger.info(
                  codeFileName,
                  "initApp",
                  "Survey status is available. Asking for conversation."
                );
                this.setState({ noSurveyDialogVisible: false });
              } else {
                logger.info(
                  codeFileName,
                  "initApp",
                  "Survey expired, updating app status."
                );
                _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
                _appStatus.CurrentSurveyID = null;
                await AppStatus.setAppStatus(
                  _appStatus,
                  codeFileName,
                  "initApp"
                );
                this.setState({ noSurveyDialogVisible: true });
              }
            } else {
              logger.info(codeFileName, "initApp", "No survey available.");

              this.setState({ noSurveyDialogVisible: true });
            }
          } else {
            logger.info(
              codeFileName,
              "initApp",
              "Settings file not found. Navigating to settings page."
            );
            this.props.navigation.navigate("UserSettings");
          }
        } catch (error) {
          logger.error(
            codeFileName,
            "initApp",
            "Error reading user settings file:" + error.message
          );
        }
      }
    }
  };

  async UNSAFE_componentWillMount() {
    logger.info(codeFileName, "componentWillMount", "Initializing app status.");

    await AppStatus.initAppStatus();
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Components mounted.");

    //await AppStatus.initAppStatus();

    onAppOpen.backCallBack = this.onAppOpen;
  }

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  //  UpdateWifiState()
  //  {
  //    wifi.isEnabled((isEnabled) => {
  //    if (isEnabled)
  //      {
  //        wifi.connectionStatus((isConnected) => {
  //          if (isConnected) {
  //              wifi.getSSID((ssid) => {
  //                this.setState({msg: "Connected: "+ssid});
  //              });
  //            } else {
  //              this.setState({msg: "Not connected!"});
  //          }
  //        });
  //
  //        this.setState({msg: "Wifi is enabled!"});
  //      }
  //      else
  //      {
  //        this.setState({msg: "Wifi not enabled!"});
  //      }
  //    });
  //  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "stretch",
            backgroundColor: "lavender",
            margin: 5
          }}
        >
          {
            <NavigationEvents
              onDidFocus={async payload => {
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

                onAppOpen.backCallBack = this.onAppOpen;
                const _locationEnabled = await utilities.isLocationSharingEnabled();
                this.setState({ locationEnabled: _locationEnabled });

                logger.info(codeFileName, "onDidFocus", "Calling initApp.");
                await this.initApp();
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
          }

          {!this.state.noSurveyDialogVisible &&
            !this.state.studyPeriodEnded &&
            !this.state.exitSurveyDone &&
            !this.state.exitSurveyAvailable && (
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "space-around",
                  alignItems: "center",
                  margin: 5
                }}
              >
                <Text
                  style={{
                    color: "green",
                    fontSize: 24,
                    margin: 0,
                    textAlign: "center"
                  }}
                >
                  {strings.NEW_SURVEY_HEADER}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    margin: 0,
                    marginTop: 20,
                    textAlign: "center"
                  }}
                >
                  {strings.CONVERSATION_PROMPT}
                </Text>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    margin: 10
                  }}
                >
                  <TouchableHighlight
                    style={[commonStyles.buttonTouchHLStyle, { width: 100 }]}
                  >
                    <Button
                      title="Yes"
                      color="#20B2AA"
                      onPress={() => {
                        logger.info(
                          codeFileName,
                          "ConversationButtonYes",
                          "Calling hadConversationYes()."
                        );
                        this.hadConversationYes();
                      }}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={[commonStyles.buttonTouchHLStyle, { width: 100 }]}
                  >
                    <Button
                      title="No"
                      color="#20B2AA"
                      onPress={() => {
                        logger.info(
                          codeFileName,
                          "ConversationButtonNo",
                          "Calling hadConversationNo()."
                        );
                        this.hadConversationNo();
                      }}
                    />
                  </TouchableHighlight>
                </View>
              </View>
            )}

          {this.state.noSurveyDialogVisible && (
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                backgroundColor: "lavender",
                margin: 20
              }}
            >
              <Text
                style={{
                  margin: 5,
                  fontSize: 18,
                  borderBottomColor: "black",
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  padding: 5
                }}
              >
                {strings.NO_SURVEY_AVAILABLE}
              </Text>
              <Text style={{ fontSize: 16, margin: 10, marginTop: 10 }}>
                {strings.MIMI_ADVERTISEMENT}
              </Text>

              {!this.state.locationEnabled && (
                <Text
                  style={{
                    fontSize: 16,
                    margin: 10,
                    marginTop: 10,
                    fontWeight: "bold"
                  }}
                >
                  {strings.LOCATION_SHARE_PROMPT}
                </Text>
              )}
            </View>
          )}

          {this.state.studyPeriodEnded && (
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                backgroundColor: "lavender",
                margin: 20
              }}
            >
              {this.state.exitSurveyAvailable && !this.state.exitSurveyDone && (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center"
                  }}
                >
                  <Text
                    style={{
                      margin: 5,
                      fontSize: 18,
                      borderBottomColor: "black",
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      padding: 5
                    }}
                  >
                    {strings.EXIT_SURVEY_INTRO(
                      this.state.ExitSurveyRemainingDays
                    )}
                  </Text>

                  <TouchableHighlight style={[commonStyles.buttonTouchHLStyle]}>
                    <Button
                      title="Take the exit survey"
                      color="#20B2AA"
                      onPress={() => {
                        logger.info(
                          codeFileName,
                          "Study ended modal",
                          "Starting exit survey."
                        );
                        this.props.navigation.navigate("ExitSurvey");
                      }}
                    />
                  </TouchableHighlight>
                </View>
              )}

              {!this.state.exitSurveyAvailable && (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center"
                  }}
                >
                  <Text
                    style={{
                      margin: 5,
                      fontSize: 18,
                      borderBottomColor: "black",
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      padding: 5
                    }}
                  >
                    {this.state.canUninstallApp
                      ? strings.FINAL_THANK_EXTENDED
                      : strings.FINAL_THANK}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              margin: 10,
              marginTop: 5,
              marginBottom: 20
            }}
          >
            <View
              style={{ height: 0.5, width: "100%", backgroundColor: "grey" }}
            />
            <Text style={{ fontSize: 16, margin: 0, textAlign: "center" }}>
              {strings.CONTACT_TEXT}
              <Text
                style={{
                  color: "blue",
                  fontSize: 16,
                  margin: 0,
                  textDecorationLine: "underline"
                }}
                onPress={() => {
                  logger.info(codeFileName, "Contact link", "Sending email.");
                  utilities.sendEmail([strings.CONTACT_EMAIL], "", "");
                }}
              >
                {" "}
                {strings.CONTACT_EMAIL}
              </Text>
            </Text>
          </View>

          <DialogInput
            isDialogVisible={this.state.invitationCodeDialogVisible}
            title={this.state.invitationCodePrompt}
            textInputProps={{ keyboardType: "numeric" }}
            submitInput={async code => {
              await this.promisedSetState({ invitationCode: code });

              const _code = this.state.invitationCode;
              const debugCode = isDebugCode(_code);
              if (debugCode || isValidInvitationCode(_code)) {
                Sentry.setUser({ id: _code });

                logger.info(
                  codeFileName,
                  "invitationCodeDialog",
                  "Entered invitation code:" +
                    this.state.invitationCode +
                    ". Writing it to file."
                );
                const _written = await utilities.writeJSONFile(
                  { InvitationCode: _code },
                  INVITATION_CODE_FILE_PATH,
                  codeFileName,
                  "invitationCodeDialog"
                );
                if (_written) {
                  try {
                    await AsyncStorage.setItem("@HAS_LAUNCHED", "true");
                    const _uuid = await UUIDGenerator.getRandomUUID();
                    const _installationDate = new Date();

                    const _appStatus = await AppStatus.getStatus();
                    _appStatus.InstallationDate = _installationDate;
                    _appStatus.LastSurveyCreationDate = _installationDate; //this should not be a problem, since survey count is still zero.
                    _appStatus.UUID = _uuid;
                    _appStatus.InvitationCode = _code;

                    if (debugCode) {
                      _appStatus.Debug = true;
                    }

                    logger.info(
                      codeFileName,
                      "invitationCodeDialog",
                      "Setting app status properties."
                    );
                    await AppStatus.setAppStatus(
                      _appStatus,
                      codeFileName,
                      "invitationCodeDialog"
                    );
                  } catch (e) {
                    logger.error(
                      codeFileName,
                      "invitationCodeDialog",
                      "Failed to set installation flag:" + e.message
                    );
                  }

                  await this.promisedSetState({
                    invitationCodeDialogVisible: false,
                    invitationCodeObtained: true
                  });
                  logger.info(
                    codeFileName,
                    "invitationCodeDialog",
                    "Navigating to settings page."
                  );

                  this.props.navigation.navigate("UserSettings", {
                    firstLaunch: true,
                    backCallBack: null
                  });
                } else {
                  logger.error(
                    codeFileName,
                    "invitationCodeDialog",
                    "Error saving invitation code. Asking to try again."
                  );
                  Alert.alert(
                    "Error",
                    strings.INVITATION_CODE_FAIL,
                    [{ text: "OK", onPress: () => BackHandler.exitApp() }],
                    { cancelable: false }
                  );
                }
              } else {
                this.setState({
                  invitationCodePrompt: strings.INVALID_INVITE
                });
              }
            }}
            closeDialog={async () => {
              if (this.state.invitationCodeObtained) {
                await this.promisedSetState({
                  invitationCodeDialogVisible: false
                });
              } else {
                await this.promisedSetState({
                  invitationCodePrompt: strings.INVITE_REQUIRED
                });
              }
            }}
          />
        </View>
      </ScrollView>
    );
  }

  componentWillUnmount() {
    logger.info(codeFileName, "componentWillUnmount", "Unmounting components.");
  }
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    state: PropTypes.shape({ routeName: PropTypes.string.isRequired })
  }).isRequired
};
