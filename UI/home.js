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
import * as RNFS from "react-native-fs";
import DialogInput from "react-native-dialog-input";
import UUIDGenerator from "react-native-uuid-generator";
import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
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

  async startSurvey() {
    //Will be called if participants indicate recent conversation
    Alert.alert(
      strings.NEW_SURVEY_HEADER,
      strings.CONVERSATION_PROMPT,
      [
        {
          text: "Yes",
          onPress: () => {
            logger.info(
              `${codeFileName}`,
              "'Yes' to recent conversation",
              "Navigating to StartSurvey page."
            );

            this.props.navigation.navigate("StartSurvey");
            notificationController.cancelNotifications();
          }
        },
        {
          text: "No",
          onPress: () => {
            logger.info(
              `${codeFileName}`,
              "'No' to recent conversation",
              "Exiting App."
            );

            Alert.alert("Thank you!", "We will try again later.", [
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
        }
      ],
      { cancelable: false }
    );
  }

  onBackButtonPress = () => {
    BackHandler.exitApp();
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
            } else if (_appStatus.SurveyStatus === SURVEY_STATUS.AVAILABLE) {
              //check if survey is available from app settings
              logger.info(
                codeFileName,
                "initApp",
                "New survey available. Asking for conversation."
              );
              this.setState({ noSurveyDialogVisible: false });
              await this.startSurvey();
            } else if (_appStatus.SurveyStatus === SURVEY_STATUS.ONGOING) {
              //Survey is ongoing
              logger.info(
                codeFileName,
                "initApp",
                "Survey is ongoing. Returning"
              );
              this.setState({ noSurveyDialogVisible: false });
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
    if (Platform.OS === "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPress.bind(this)
      );
    }
    this.props.navigation.setParams({ backCallBack: this.initApp.bind(this) });
    onAppOpen.backCallBack = this.initApp.bind(this);
    await this.initApp();
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
            {Platform.OS === "android" && (
              <TouchableHighlight style={[commonStyles.buttonTouchHLStyle]}>
                <Button
                  title={strings.TRY_LATER_BUTTON}
                  color="#20B2AA"
                  onPress={() => {
                    logger.info(
                      `${codeFileName}`,
                      "No survey modal",
                      "Closing app"
                    );
                    this.setState({ noSurveyDialogVisible: false });
                    BackHandler.exitApp();
                  }}
                />
              </TouchableHighlight>
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

            {this.state.exitSurveyDone && (
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
        <DialogInput
          isDialogVisible={this.state.invitationCodeDialogVisible}
          title={this.state.invitationCodePrompt + " Testing mode"} //reminder that it is in testing mode
          submitInput={async code => {
            await this.promisedSetState({ invitationCode: code });
            //TODO: check validity of the code
            const _code = this.state.invitationCode;
            if (_code.length >= 2 && _code.toLowerCase().startsWith("i")) {
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
    logger.info(
      codeFileName,
      "componentWillUnmount",
      "Removing listeners and event handlers"
    );
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPress
      );
    }
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
