import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TouchableHighlight,
  BackHandler
} from "react-native";
import { NavigationEvents } from "react-navigation";
import * as RNFS from "react-native-fs";
import UUIDGenerator from "react-native-uuid-generator";
import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import DialogInput from "./vendor/DialogInput";
import notificationController, {
  onAppOpen
} from "../controllers/notificationController";
import logger from "../controllers/logger";
import appStatus from "../controllers/appStatus";
import * as strings from "../controllers/strings";
import commonStyles from "./Style";
import ToolBar from "./toolbar";
import utilities from "../controllers/utilities";
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
      ExitSurveyRemainingDays: 0
    };
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
            "/partial-survey--response--" +
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

    const _appStatus = await appStatus.loadStatus();
    _appStatus.CurrentSurveyID = _surveyID;
    _appStatus.SurveyStatus = SURVEY_STATUS.ONGOING;

    logger.info(
      codeFileName,
      "hadConversationYes",
      "Updating app status and navigating to startSurvey."
    );

    await appStatus.setAppStatus(_appStatus);
    notificationController.cancelNotifications();
    this.props.navigation.navigate("StartSurvey");
  }

  async hadConversationNo() {
    logger.info(
      `${codeFileName}`,
      "'No' to recent conversation",
      "Uploading response and exiting App."
    );

    const _appStatus = await appStatus.loadStatus();
    utilities.uploadData(
      {
        Stage: "Recent conversation.",
        PartialResponse: "No recent conversation.",
        Time: new Date()
      },
      _appStatus.UUID,
      "NoConversationResponse",
      codeFileName,
      "startSurvey",
      HomeScreen.fileUploadCallBack
    );

    if (_appStatus.Debug) {
      _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
      await appStatus.setAppStatus(_appStatus);
      this.initApp();
      return;
    }

    Alert.alert(strings.NO_CONVERSATION_HEADER, strings.NO_CONVERSATION, [
      {
        text: "OK",
        onPress: () => {
          if (Platform.OS === "android") {
            BackHandler.exitApp();
          }
        }
      }
    ]);
  }

  async startSurvey() {
    //Will be called if participants indicate recent conversation
    Alert.alert(
      strings.NEW_SURVEY_HEADER,
      strings.CONVERSATION_PROMPT,
      [
        {
          text: "Yes",
          onPress: () => {
            this.hadConversationYes();
          }
        },
        {
          text: "No",
          onPress: () => {
            this.hadConversationNo();
          }
        }
      ],
      { cancelable: false }
    );
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
      const _appStatus = await appStatus.loadStatus();
      logger.info(
        codeFileName,
        "initApp",
        "Current app status:" + JSON.stringify(_appStatus)
      );

      if ((await this.isFirstLaunch()) === null) {
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
            logger.info(
              codeFileName,
              "initApp",
              "Read user settings file:" + _fileContent
            );

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
              //check if survey is available from app settings
              logger.info(
                codeFileName,
                "initApp",
                "Survey status is " +
                  _appStatus.SurveyStatus +
                  ". Asking for conversation."
              );
              this.setState({ noSurveyDialogVisible: false });
              await this.startSurvey();
              return;
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

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");
    this.props.navigation.setParams({ backCallBack: this.initApp.bind(this) });
    onAppOpen.backCallBack = this.initApp.bind(this);
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

                {
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
                }
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
                  {strings.FINAL_THANK}
                </Text>
                {Platform.OS === "android" && (
                  <TouchableHighlight style={[commonStyles.buttonTouchHLStyle]}>
                    <Button
                      title="Close app"
                      color="#20B2AA"
                      onPress={() => {
                        logger.info(
                          codeFileName,
                          "Study ended modal",
                          "Closing app"
                        );
                        BackHandler.exitApp();
                      }}
                    />
                  </TouchableHighlight>
                )}
              </View>
            )}
          </View>
        )}

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-end",
            margin: 10,
            marginTop: 5,
            marginBottom: 20
          }}
        >
          <Text style={{ fontSize: 16, margin: 0 }}>
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

                  const _appStatus = appStatus.loadStatus();
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
                  await appStatus.setAppStatus(_appStatus);
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
                  backCallBack: this.initApp.bind(this)
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
