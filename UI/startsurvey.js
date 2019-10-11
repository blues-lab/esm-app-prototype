import React from "react";
import {
  Platform,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  BackHandler,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import { ProgressDialog } from "react-native-simple-dialogs";
import * as RNFS from "react-native-fs";
import logger from "../controllers/logger";
import commonStyles from "./Style";
import appStatus from "../controllers/appStatus";
import ToolBar from "./toolbar";
import * as utilities from "../controllers/utilities";
import * as strings from "../controllers/strings";
import notificationController from "../controllers/notificationController";
import { SURVEY_STATUS } from "../controllers/constants";

const codeFileName = "startsurvey.js";

export default class SurveyStartScreen extends React.Component {
  static navigationOptions = {
    headerLeft: null,
    headerTitle: <ToolBar title={strings.TALKING_ABOUT_HEADER} progress={0} />
  };

  constructor(props) {
    super(props);
    this.state = {
      conversationTopic: "",
      saveWaitVisible: false //show progress dialog while saving survey response
    };
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "StartSurvey") {
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

  static async fileUploadCallBack(success, error = null, data = null) {
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload partial response, error: ${error}. Stage:Conversation topic. Saving in file: ${data !=
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
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    _appStatus.CurrentSurveyID = null;
    await appStatus.setAppStatus(_appStatus);

    Alert.alert(
      strings.SURVEY_EXPIRED_HEADER,
      strings.SURVEY_EXPIRED,
      [
        {
          text: "OK",
          onPress: async () => {
            await logger.info(
              codeFileName,
              funcName,
              "Survey expired, going back to home."
            );
            notificationController.cancelNotifications();
            this.props.navigation.navigate("Home");
          }
        }
      ],
      { cancelable: false }
    );
  }

  async saveResponse() {
    const _appStatus = await appStatus.loadStatus();
    if (await utilities.currentSurveyExpired()) {
      await this.expireSurvey(_appStatus);
      return;
    }

    //upload partial survey response
    this.setState({ saveWaitVisible: true });
    logger.info(
      codeFileName,
      "NextButtonPress",
      "Uploading partial response and navigating to AlvaPrompt."
    );
    utilities.uploadData(
      {
        SurveyID: _appStatus.CurrentSurveyID,
        Stage: "Conversation topic.",
        PartialResponse: this.state.conversationTopic
      },
      _appStatus.UUID,
      "PartialSurveyResponse",
      codeFileName,
      "NextButtonPress",
      SurveyStartScreen.fileUploadCallBack
    );

    this.setState({ saveWaitVisible: false });

    this.props.navigation.navigate("AlvaPrompt", {
      conversationTopic: this.state.conversationTopic,
      surveyProgress: 20
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          backgroundColor: "lavender",
          margin: 5
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

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={commonStyles.questionStyle}>
              {strings.TALKING_ABOUT}
            </Text>

            <TextInput
              multiline
              numberOfLines={4}
              style={commonStyles.inputStyle}
              onChangeText={text => this.setState({ conversationTopic: text })}
              value={this.state.conversationTopic}
            />

            <Text style={{ fontSize: 14, fontStyle: "italic", margin: 10 }}>
              {strings.TALKING_ABOUT_SKIP_HINT}
            </Text>

            <View style={commonStyles.buttonViewStyle}>
              <TouchableHighlight style={commonStyles.buttonTouchHLStyle}>
                <Button
                  title="Next"
                  color="#20B2AA"
                  onPress={async () => {
                    if (this.state.conversationTopic.length === 0) {
                      Alert.alert("Error", strings.TALKING_ABOUT_REQUIRED);
                    } else {
                      await this.saveResponse();
                    }
                  }}
                />
              </TouchableHighlight>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title={strings.SAVING_HEADER}
          message={strings.SAVING_WAIT}
        />
      </View>
    );
  }
}

SurveyStartScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
};
