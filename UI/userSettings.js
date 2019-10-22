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
  Dimensions
} from "react-native";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import Mailer from "react-native-mail";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as RNFS from "react-native-fs";
import Dialog from "react-native-dialog";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { NetworkInfo } from "react-native-network-info";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import VersionNumber from "react-native-version-number";
import { uploadFiles } from "../controllers/backgroundJobs";
import AppStatus from "../controllers/appStatus";
import notificationController, {
  onAppOpen
} from "../controllers/notificationController";

import logger from "../controllers/logger";
import commonStyle from "./Style";
import * as utilities from "../controllers/utilities";
import {
  USER_SETTINGS_FILE_PATH,
  LOG_FILE_PATH,
  SURVEY_STATUS
} from "../controllers/constants";
import * as strings from "../controllers/strings";

const codeFileName = "userSettings.js";

const styles = StyleSheet.create({
  dayLabelStyle: {
    width: 80,
    fontSize: 18,
    marginLeft: 5,
    marginRight: 5
  },
  timeBoxStyle: {
    width: 80,
    height: 25,
    fontSize: 18,
    textAlign: "center"
  }
});

export default class UserSettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Settings",
      headerLeft: (
        <TouchableHighlight>
          <Button title="<" onPress={navigation.getParam("backHandler")}>
            {" "}
          </Button>
        </TouchableHighlight>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      homeWifi: "",
      askWifi: true,
      isDateTimePickerVisible: false,
      stateSaved: true,
      afterTimeSelected: true, //indicates if the 'after' or 'before' time was selected
      afterTime: "23:59",
      beforeTime: "00:01",
      backCallBack: null, // a callback function sent by Home screen
      wifiPermissionDialogVisible: false
    };

    AppStatus.getStatus().then(status => {
      this.state.debug = status.Debug;
      this.state.invitationCode = status.InvitationCode
        ? status.InvitationCode
        : "not available";
    });

    this.userSettingsCallBack = this.userSettingsCallBack.bind(this);
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");

    await this.promisedSetState({
      backCallBack: this.props.navigation.getParam("backCallBack", null)
    });

    this.props.navigation.setParams({
      backHandler: this.handleBackNavigation.bind(this)
    });

    onAppOpen.userSettingsCallBack = this.userSettingsCallBack;

    this.loadSettings();
  }

  componentWillUnmount() {
    logger.info(codeFileName, "componentWillUnmount", "Unmounting components.");
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "UserSettings") {
      logger.info(
        codeFileName,
        "onBackButtonPressAndroid",
        "Calling handleBackNavigation."
      );
      this.handleBackNavigation();
      return true;
    }

    logger.error(
      codeFileName,
      "onBackButtonPressAndroid",
      "This should not be the event handler for page: " +
        this.props.navigation.state.routeName
    );
    return false;
  };

  userSettingsCallBack() {
    logger.info(
      codeFileName,
      "userSettingsCallBack",
      "Going back to the previous page."
    );
    this.props.navigation.goBack(null);
  }

  async getHomeSSID() {
    try {
      const _ssid = await NetworkInfo.getSSID();
      logger.info(
        codeFileName,
        "getHomeSSID",
        "Obtained ssid. null? " + (_ssid === null)
      );

      if (_ssid !== null && _ssid.length > 0 && _ssid !== "<unknown ssid>") {
        logger.info(
          codeFileName,
          "getHomeSSID",
          "Connected to WiFi. Asking if this the is Home WiFi."
        );
        Alert.alert(
          "Home WiFi",
          strings.HOME_WIFI_PROMPT(_ssid),
          [
            {
              text: "NO",
              onPress: () => {
                Alert.alert("Home WiFi", strings.NOT_HOME_WIFI);
                logger.info(
                  codeFileName,
                  "getHomeSSID",
                  "Not connected to home WiFi. Will ask again."
                );
              }
            },
            {
              text: "YES",
              onPress: () => {
                logger.info(
                  codeFileName,
                  "getHomeSSID",
                  "Connected to home WiFi. Saving home WiFi."
                );
                this.setState({ homeWifi: _ssid }, async () =>
                  this.saveSettings()
                );
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        logger.info(
          codeFileName,
          "getHomeSSID",
          "WiFi is not enabled or connected. Will check again later."
        );
        Alert.alert("Home WiFi", strings.HOME_WIFI_NOT_CONNECTED);
      }
    } catch (error) {
      logger.error(
        codeFileName,
        "getHomeSSID",
        "Failed to get WiFi information:" + error
      );
    }
  }

  async getHomeWiFi() {
    logger.info(
      codeFileName,
      "getHomeWiFi",
      "Checking if location permission is already granted."
    );
    const _response = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // ['authorized', 'denied', 'restricted', or 'undetermined']
    if (_response === RESULTS.GRANTED) {
      logger.info(
        codeFileName,
        "getHomeWiFi",
        "Location permission is already granted. Asking for home wifi name."
      );
      await this.getHomeSSID();
    } else {
      logger.info(
        codeFileName,
        "getHomeWiFi",
        "Location permission is not granted. Asking for permission."
      );
      await this.promisedSetState({ wifiPermissionDialogVisible: true });
    }
  }

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  async loadSettings() {
    if (await RNFS.exists(USER_SETTINGS_FILE_PATH)) {
      const _fileContent = await RNFS.readFile(USER_SETTINGS_FILE_PATH);
      logger.info(
        `${codeFileName}`,
        "loadSettings",
        "Successfully loaded settings file."
      );
      const _userSettingsData = JSON.parse(_fileContent);
      await this.promisedSetState({
        homeWifi: _userSettingsData.homeWifi,
        afterTime: _userSettingsData.afterTime,
        beforeTime: _userSettingsData.beforeTime,
        askWifi: _userSettingsData.askWifi
      });

      if (this.state.homeWifi.length === 0) {
        logger.info(
          `${codeFileName}`,
          "loadSettings",
          "Home wifi is not set yet."
        );
        await this.getHomeWiFi();
      }
    } else {
      await this.saveSettings(); //save the default settings
      await this.getHomeWiFi();
    }
  }

  handleBackNavigation() {
    if (!this.state.stateSaved) {
      logger.info(
        codeFileName,
        "handleBackNavigation",
        "Back button pressed, asking to save settings."
      );
      Alert.alert(strings.SAVE_CHANGES_PROMPT, "", [
        {
          text: "NO",
          onPress: () => {
            logger.info(
              codeFileName,
              "handleBackNavigation",
              "Declined to save settings, going to previous page."
            );
            if (this.state.backCallBack != null) {
              logger.info(
                codeFileName,
                "handleBackNavigation",
                "Calling backCallBack."
              );
              this.state.backCallBack();
            }

            this.props.navigation.goBack(null);
          }
        },
        {
          text: "YES",
          onPress: async () => {
            logger.info(
              codeFileName,
              "handleBackNavigation",
              "Agreed to save settings, saving and then going to previous page."
            );
            await this.saveSettings();
            Alert.alert(strings.SETTINGS_SAVED, "", [
              { text: "OK", onPress: () => this.props.navigation.goBack(null) }
            ]);
          }
        }
      ]);
    } else {
      logger.info(
        codeFileName,
        "handleBackNavigation",
        "Back button pressed, nothing to save, going to previous page."
      );
      if (this.state.backCallBack != null) {
        logger.info(
          codeFileName,
          "handleBackNavigation",
          "Calling backCallBack."
        );
        this.state.backCallBack();
      }
      this.props.navigation.goBack(null);
    }
  }

  handleDatePicked = time => {
    const _hour = time.getHours() > 9 ? time.getHours() : "0" + time.getHours();
    const _min =
      time.getMinutes() > 9 ? time.getMinutes() : "0" + time.getMinutes();

    if (this.state.afterTimeSelected) {
      this.setState({ afterTime: _hour + ":" + _min });
    } else {
      this.setState({ beforeTime: _hour + ":" + _min });
    }

    this.setState({ isDateTimePickerVisible: false, stateSaved: false });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  async saveSettings() {
    const _settings = {
      homeWifi: this.state.homeWifi,
      askWifi: this.state.askWifi,
      afterTime: this.state.afterTime,
      beforeTime: this.state.beforeTime
    };

    logger.info(
      codeFileName,
      "saveSettings",
      "Saving settings:" + JSON.stringify(_settings)
    );

    const _saved = await utilities.writeJSONFile(
      _settings,
      USER_SETTINGS_FILE_PATH,
      codeFileName,
      "saveSettings"
    );

    if (!_saved) {
      await utilities.showErrorDialog(
        codeFileName,
        "saveSettings",
        "Failed to load settings file."
      );
    }
  }

  changeWifi = async () => {
    logger.info(
      codeFileName,
      "changeWifi",
      "Setting current wifi to empty and getting new wifi info."
    );
    this.setState({ homeWifi: "" }, async () => {
      await this.saveSettings();
      this.getHomeWiFi();
    });
  };

  static convertTime(time) {
    let _hour = Number(time.split(":")[0]);
    const _min = time.split(":")[1];

    let ret = "";

    if (_hour === 12) {
      ret = _hour.toString() + ":" + _min + " PM";
    } else if (_hour === 0) {
      ret = "12:" + _min + " AM";
    } else if (_hour >= 13) {
      _hour -= 12;
      _hour = _hour > 9 ? _hour.toString() : "0" + _hour.toString();
      ret = _hour + ":" + _min + " PM";
    } else {
      ret =
        (_hour > 9 ? _hour.toString() : "0" + _hour.toString()) +
        ":" +
        _min +
        " AM";
    }

    return ret;
  }

  static async askForLocationSharingAndroid() {
    logger.info(
      codeFileName,
      "LocationPermissionDialog",
      "Checking if location sharing is enabled."
    );

    let _locationSharingEnabled = false;
    try {
      const _locationEnabled = await LocationServicesDialogBox.checkLocationServicesIsEnabled(
        {
          showDialog: false, // false => Opens the Location access page directly
          openLocationServices: false // false => Directly catch method is called if location services are turned off
        }
      );
      logger.info(
        codeFileName,
        "LocationPermissionDialog",
        "Location sharing status: " + JSON.stringify(_locationEnabled)
      );

      _locationSharingEnabled = _locationEnabled.status === "enabled";
    } catch (error) {
      logger.error(
        codeFileName,
        "LocationPermissionDialog",
        "Failed to check if location sharing is enabled. Error: " +
          error.message
      );

      if (!_locationSharingEnabled) {
        logger.info(
          codeFileName,
          "LocationPermissionDialog",
          "Location sharing is not enabled. Asking to share location."
        );

        try {
          const _locationEnabled = await LocationServicesDialogBox.checkLocationServicesIsEnabled(
            {
              message: "",
              ok: "YES",
              cancel: "NO",
              enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
              showDialog: false, // false => Opens the Location access page directly
              openLocationServices: true, // false => Directly catch method is called if location services are turned off
              preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
              preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
              providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
            }
          );

          if (_locationEnabled.status === "enabled") {
            // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
            logger.info(
              codeFileName,
              "LocationPermissionDialog",
              "Location sharing is enabled. Status: " +
                JSON.stringify(_locationEnabled)
            );
          } else {
            logger.warn(
              codeFileName,
              "LocationPermissionDialog",
              "Location sharing was not enabled. Status: " +
                JSON.stringify(_locationEnabled)
            );
          }
        } catch (err) {
          logger.error(
            codeFileName,
            "LocationPermissionDialog",
            "Failed to get location sharing enabled. Error: " + err.message
          );
        }
      }
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "lavender"
        }}
      >
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
            onAppOpen.userSettingsCallBack = this.userSettingsCallBack;
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

        <Text>ALVA version: {VersionNumber.appVersion}</Text>
        <Text>Invitation code: {this.state.invitationCode}</Text>
        <Text
          style={{
            width: Math.floor(Dimensions.get("window").width * 0.9),
            borderBottomColor: "black",
            borderBottomWidth: StyleSheet.hairlineWidth
          }}
        />

        {this.state.debug && (
          <View>
            <Button
              title="Take the exit survey"
              color="#20B2AA"
              onPress={async () => {
                logger.info(
                  codeFileName,
                  "StartExitSurveyButton",
                  "Starting exit survey."
                );
                this.props.navigation.navigate("ExitSurvey");
              }}
            />
            <Button
              title="Start survey"
              color="#20B2AA"
              onPress={async () => {
                logger.info(
                  codeFileName,
                  "StartSurveyButton",
                  "Starting daily survey from the settings page."
                );

                notificationController.cancelNotifications();
                notificationController.showNotification(
                  strings.NEW_SURVEY_AVAILABLE,
                  strings.SURVEY_TIME(60)
                );

                const _appStatus = await AppStatus.getStatus();
                const _currentDate = new Date();
                _appStatus.SurveyCountToday += 1;
                _appStatus.SurveyStatus = SURVEY_STATUS.AVAILABLE;
                _appStatus.LastSurveyCreationDate = _currentDate;
                _appStatus.FirstNotificationTime = _currentDate;
                _appStatus.LastNotificationTime = _currentDate;
                await AppStatus.setAppStatus(
                  _appStatus,
                  codeFileName,
                  "StartSurveyButton"
                );

                if (this.state.backCallBack != null) {
                  logger.info(
                    codeFileName,
                    "StartSurveyButton",
                    "Calling backCallBack."
                  );
                  this.state.backCallBack();
                }
                this.props.navigation.goBack(null);
              }}
            />
            <Button
              title="Email log"
              color="#20B2AA"
              onPress={async () => {
                try {
                  const _fileContent = await RNFS.readFile(LOG_FILE_PATH);
                  Mailer.mail(
                    {
                      subject: "ALVA log",
                      recipients: ["researchlab@icsi.berkeley.edu"],
                      body: `<b>${_fileContent}</b>`,
                      isHTML: true
                    },
                    (error, event) => {
                      Alert.alert(
                        "Error sending email.",
                        error.message + event
                      );
                    }
                  );
                } catch (error) {
                  Alert.alert("Error", error.message);
                }
              }}
            />
          </View>
        )}

        {this.state.homeWifi.length > 0 && (
          <Text
            style={{
              textAlign: "center",
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
              color: "black",
              marginTop: 10,
              marginBottom: 10,
              fontSize: 20,
              width: Math.floor(Dimensions.get("window").width * 0.9)
            }}
          >
            <Text style={{ marginBottom: 10, fontSize: 16, paddingBottom: 10 }}>
              {" "}
              Your home WiFi:{" "}
            </Text>
            <Text style={{ fontSize: 20, margin: 0 }}>
              {this.state.homeWifi}
            </Text>
            <Text>{"\n"}</Text>
            <Text
              style={{
                color: "blue",
                fontSize: 16,
                margin: 0,
                textDecorationLine: "underline"
              }}
              onPress={this.changeWifi}
            >
              Change
            </Text>
            <Text>{"\n"}</Text>
          </Text>
        )}

        <Text
          style={{
            color: "black",
            margin: 10,
            fontSize: 20,
            textAlign: "center"
          }}
        >
          {strings.DONT_DISTURB}
        </Text>

        <Text style={{ margin: 10, fontSize: 18, textAlign: "center" }}>
          {strings.DONT_DISTURB_AFTER}
        </Text>
        <TouchableHighlight
          style={{ borderWidth: 0.5, padding: 5 }}
          onPress={() => {
            this.setState({
              afterTimeSelected: true,
              isDateTimePickerVisible: true
            });
          }}
        >
          <Text style={styles.timeBoxStyle}>
            {UserSettingsScreen.convertTime(this.state.afterTime)}
          </Text>
        </TouchableHighlight>
        <Text style={{ margin: 10, fontSize: 18, textAlign: "center" }}>
          {strings.DONT_DISTURB_BEFORE}
        </Text>
        <TouchableHighlight
          style={{ borderWidth: 0.5, padding: 5 }}
          onPress={() => {
            this.setState({
              afterTimeSelected: false,
              isDateTimePickerVisible: true
            });
          }}
        >
          <Text style={styles.timeBoxStyle}>
            {UserSettingsScreen.convertTime(this.state.beforeTime)}
          </Text>
        </TouchableHighlight>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            margin: 10,
            paddingTop: 30,
            width: Math.floor(Dimensions.get("window").width * 0.9),
            borderBottomColor: "black",
            borderTopWidth: StyleSheet.hairlineWidth
          }}
        >
          <TouchableHighlight style={[commonStyle.buttonTouchHLStyle]}>
            <Button
              title="Save settings"
              color="#20B2AA"
              onPress={async () => {
                await this.saveSettings();
                this.setState({ stateSaved: true });
                const _firstLaunch = this.props.navigation.getParam(
                  "firstLaunch",
                  false
                );
                if (_firstLaunch) {
                  Alert.alert(
                    "Thank you!",
                    strings.SETTINGS_SAVED_FIRST_TIME,
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          logger.info(
                            codeFileName,
                            "SaveButtonClick",
                            "Settings saved. Since this is first launch exiting app."
                          );
                          BackHandler.exitApp();
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                } else {
                  Alert.alert(strings.SETTINGS_SAVED);
                }
              }}
            />
          </TouchableHighlight>
        </View>

        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
          is24Hour={false}
          mode="time"
        />

        <Dialog.Container visible={this.state.wifiPermissionDialogVisible}>
          <Dialog.Title>WiFi permission</Dialog.Title>
          <Dialog.Description>{strings.WIFI_PERMISSION_MSG}</Dialog.Description>
          <Dialog.Button
            label="Cancel"
            onPress={async () => {
              logger.info(
                codeFileName,
                "LocationPermissionDialog",
                "Pressed cancel. Exiting app."
              );
              await this.promisedSetState({
                wifiPermissionDialogVisible: false
              });
              BackHandler.exitApp();
            }}
          />
          <Dialog.Button
            label="Allow"
            onPress={async () => {
              logger.info(
                codeFileName,
                "LocationPermissionDialog",
                "Pressed allow. Asking for actual permission."
              );
              await this.promisedSetState({
                wifiPermissionDialogVisible: false
              });
              const response = await request(
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
              );
              if (response !== RESULTS.GRANTED) {
                logger.info(
                  codeFileName,
                  "LocationPermissionDialog",
                  "Location permission denied. Exiting app."
                );
                BackHandler.exitApp();
              } else {
                logger.info(
                  codeFileName,
                  "LocationPermissionDialog",
                  "Location permission granted. Checking if location sharing is enabled."
                );
                if (Platform.OS === "android") {
                  await UserSettingsScreen.askForLocationSharingAndroid();
                } else {
                  //iOS platform, try to obtain ssid without asking to enable location sharing
                  //corresponding method to enable location sharing for iOS
                }

                await logger.info(
                  codeFileName,
                  "LocationPermissionDialog",
                  "Getting home wifi."
                );
                await this.getHomeSSID();
                //send log data to the server
                await uploadFiles();
              }
            }}
          />
        </Dialog.Container>
      </View>
    );
  }
}

UserSettingsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  }).isRequired
};
