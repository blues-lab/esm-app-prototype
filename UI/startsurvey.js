import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  BackHandler,
  TouchableHighlight,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import PropTypes from "prop-types";
import { ProgressDialog } from "react-native-simple-dialogs";
import * as RNFS from "react-native-fs";
import logger from "../controllers/logger";
import commonStyles from "./Style";
import appStatus from "../controllers/appStatus";
import ToolBar from "./toolbar";
import utilities from "../controllers/utilities";
import * as strings from "../controllers/strings";
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
      noSurveyDialogVisible: false,
      saveWaitVisible: false //show progress dialog while saving survey response
    };
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Setting event handlers.");

    if (Platform.OS === "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid.bind(this)
      );
    }

    const _surveyID = "SurveyID-" + Date.now();

    const _appStatus = await appStatus.loadStatus();
    _appStatus.CurrentSurveyID = _surveyID;
    _appStatus.SurveyStatus = SURVEY_STATUS.ONGOING;
    await appStatus.setAppStatus(_appStatus);
    logger.info(
      codeFileName,
      "componentDidMount",
      "Starting new survey with id: " + _surveyID
    );
  }

  onBackButtonPressAndroid = () => {
    //BackHandler.exitApp();
    return true; //make it true to prevent going back
  };

  componentWillUnmount() {
    logger.info(
      codeFileName,
      "componentWillUnmount",
      "Removing event handlers."
    );
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      );
    }
  }

  static fileUploadCallBack(success, error = null, data = null) {
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload partial response, error: ${error}. Stage:Conversation topic. Saving in file: ${data !=
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
                      //upload partial survey response
                      {
                        this.setState({ saveWaitVisible: true });
                        const _appStatus = await appStatus.loadStatus();
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
                      }
                      this.props.navigation.navigate("AlvaPrompt", {
                        conversationTopic: this.state.conversationTopic,
                        surveyProgress: 20
                      });
                    }
                  }}
                />
              </TouchableHighlight>
            </View>

            <Modal visible={this.state.noSurveyDialogVisible}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "lavender",
                  margin: 1
                }}
              >
                <Text
                  style={{
                    margin: 15,
                    fontSize: 20,
                    borderBottomColor: "black",
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    padding: 5
                  }}
                >
                  Sorry, survey has expired!
                </Text>
                <Text style={{ fontSize: 16, margin: 20, marginTop: 10 }}>
                  Advertisement/reminder for MIMI and suggestion to come back
                  later.
                </Text>
                <TouchableHighlight style={[commonStyles.buttonTouchHLStyle]}>
                  <Button
                    title="I will come back later!"
                    color="#20B2AA"
                    onPress={() => {
                      logger.info(
                        `${codeFileName}`,
                        "No survey modal",
                        "Closing app"
                      );
                      this.setState({ noSurveyDialogVisible: false });
                    }}
                  />
                </TouchableHighlight>
              </View>
            </Modal>
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
