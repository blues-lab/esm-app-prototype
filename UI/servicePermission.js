import React from "react";
import {
  Platform,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  BackHandler
} from "react-native";
import DialogInput from "react-native-dialog-input";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import * as RNFS from "react-native-fs";
import { ProgressDialog } from "react-native-simple-dialogs";
import Icon from "react-native-vector-icons/Fontisto";
import commonStyle from "./Style";
import logger from "../controllers/logger";
import * as utilities from "../controllers/utilities";
import ToolBar from "./toolbar";
import AppStatus from "../controllers/appStatus";
import * as strings from "../controllers/strings";
import notificationController from "../controllers/notificationController";
import { SURVEY_STATUS } from "../controllers/constants";

const codeFileName = "servicePermission.js";

const fullShare = "fullShare";
const partialShare = "partialShare";
const noShare = "noShare";

export default class ServicePermissionScreen extends React.Component {
  // static navigationOptions = {
  //      headerLeft: null,
  //      headerTitle: <ToolBar title="Permission" progress={70}/>
  //    };
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: (
        <ToolBar
          title="Permission"
          progress={navigation.state.params.surveyProgress}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      services: null, //the service list sent from the serviceMenu page
      currentServiceIdx: 0,
      sharingDecision: "",
      whyNoShare: "",
      whyPartShare: "",
      partsToRedact: "",
      permissionResponses: [],
      surveyResponseJS: null, // full survey response so far sent from the serviceMenu page
      saveWaitVisible: false,
      askingPermissionFollowUpQuestions: false, //indicates whether permission options or follow up questions should be shown
      askingPermissionQuestions: true,
      askingDataRetentionQuestions: false, //should the data retention question be shown?
      askingDataRetentionLengthQuestions: false, //should the data retention length question be shown?
      dataRetentionTranscriptDecision: "", //selected decision about transcript
      dataRetentionLengthDecision: "", //selected decision about data retention length
      dataRetentionTranscriptDialogVisible: false, // dialog visible to explain 'other' option for transcript question?
      dataRetentionLengthSpecificDialogVisible: false, // dialog visible to explain 'specific_text' option for length question?
      dataRetentionLengthOtherDialogVisible: false, // dialog visible to explain 'other' option for length question?
      dataRetentionTranscriptOtherText: "", //  explanation for 'other' option for transcript question
      dataRetentionLengthSpecificText: "", //response for 'store for a specific amount of time ______ (open-ended answer)'
      dataRetentionLengthOtherText: "" //  explanation for 'other' option for length question
    };

    this.permissionOptions = [
      {
        key: fullShare,
        value: strings.ACCESS_ALLOW
      },
      {
        key: partialShare,
        value: strings.ACCESS_PARTIAL
      },
      {
        key: noShare,
        value: strings.ACCESS_DENY
      }
    ];

    this.dataRetentionTranscriptOptions = [
      {
        key: "agree",
        value: strings.DATA_RETENTION_TRANSCRIPT_OPTIONS[0]
      },

      {
        key: "deny",
        value: strings.DATA_RETENTION_TRANSCRIPT_OPTIONS[1]
      },
      {
        key: "other",
        value: strings.DATA_RETENTION_TRANSCRIPT_OPTIONS[2]
      }
    ];

    this.dataRetentionLengthOptions = [
      {
        key: "service_provided",
        value: strings.DATA_RETENTION_LENGTH_OPTIONS[0]
      },

      {
        key: "deliberate_delete",
        value: strings.DATA_RETENTION_LENGTH_OPTIONS[1]
      },
      {
        key: "specific_time",
        value: strings.DATA_RETENTION_LENGTH_OPTIONS[2]
      },
      {
        key: "other",
        value: strings.DATA_RETENTION_LENGTH_OPTIONS[3]
      }
    ];
  }

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");
    const { navigation } = this.props;
    const _services = navigation.getParam("services", null);
    const _surveyProgress = navigation.getParam("surveyProgress", 0);
    const _surveyResponseJS = navigation.getParam("surveyResponseJS", null);

    await this.promisedSetState({
      services: _services,
      surveyProgress: _surveyProgress,
      surveyResponseJS: _surveyResponseJS,
      askingPermissionQuestions: _services !== null,
      askingDataRetentionQuestions: _services === null
    });
  }

  static async fileUploadCallBack(success, error = null, data = null) {
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload partial response, erro: ${error}. Stage:Permission complete. Saving in file: ${data !=
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

  permissionSelectionChangedHandler = async item => {
    await this.promisedSetState({ sharingDecision: item.key });
  };

  dataRetentionTranscriptSelectionChangedHandler = async item => {
    await this.promisedSetState({
      dataRetentionTranscriptDialogVisible: item.key === "other",
      dataRetentionTranscriptDecision: item.key
    });
  };

  dataRetentionLengthSelectionChangedHandler = async item => {
    await this.promisedSetState({
      dataRetentionLengthSpecificDialogVisible: item.key === "specific_time",
      dataRetentionLengthOtherDialogVisible: item.key === "other",
      dataRetentionLengthDecision: item.key
    });
  };

  async savePermissionQuestionResponses() {
    /* 1. Check response validity and save them (if valid) to the questions asking about sharing conversation to
          receive a service.
       2. Go to the next service OR
       3. If no service remaining, then go the the data retention questions.
    */

    logger.info(
      codeFileName,
      "savePermissionQuestionResponses",
      `service:${this.state.services[this.state.currentServiceIdx].serviceName},
           sharingDecision:${this.state.sharingDecision},
           whyPartShare:${this.state.whyPartShare},
           partsToRedact:${this.state.partsToRedact},
           whyNoShare:${this.state.whyNoShare}`
    );

    // 1. Check validity
    const _notAllAnswered =
      this.state.sharingDecision.length === 0 ||
      (this.state.sharingDecision === partialShare &&
        (this.state.whyPartShare.length === 0 ||
          this.state.partsToRedact.length === 0)) ||
      (this.state.sharingDecision === noShare &&
        this.state.whyNoShare.length === 0);

    if (_notAllAnswered) {
      Alert.alert("Error", strings.ANSWER_TO_CONTINUE);
      logger.warn(
        codeFileName,
        "savePermissionQuestionResponses",
        "Not all questions were answered, returning."
      );
      return;
    }

    // 2. Save response
    const _permissionResponse = {
      ServiceCategory: this.state.services[this.state.currentServiceIdx]
        .categoryName,
      ServiceName: this.state.services[this.state.currentServiceIdx]
        .serviceName,
      Sharing:
        this.state.sharingDecision.length > 0
          ? this.state.sharingDecision
          : strings.EMPTY_STR,
      PartsToRedact:
        this.state.partsToRedact.length > 0
          ? this.state.partsToRedact
          : strings.EMPTY_STR,
      WhyPartShare:
        this.state.whyPartShare.length > 0
          ? this.state.whyPartShare
          : strings.EMPTY_STR,
      WhyNoShare:
        this.state.whyNoShare.length > 0
          ? this.state.whyNoShare
          : strings.EMPTY_STR
    };

    const _permissionResponses = this.state.permissionResponses;
    _permissionResponses.push(_permissionResponse);
    const _surveyResponseJS = this.state.surveyResponseJS;
    _surveyResponseJS.PermissionResponses = _permissionResponses;

    // 3. Go to the next service or data retention questions
    const _nextServiceIdx = this.state.currentServiceIdx + 1;
    if (_nextServiceIdx < this.state.services.length) {
      //more services remaining
      logger.info(
        codeFileName,
        "savePermissionQuestionResponses",
        "Saving response and going to the next service."
      );
      const _surveyProgress =
        this.state.surveyProgress + Math.floor(35 / this.state.services.length);
      await this.promisedSetState({
        surveyResponseJS: _surveyResponseJS,
        currentServiceIdx: _nextServiceIdx,
        surveyProgress: _surveyProgress,
        whyNoShare: "",
        whyPartShare: "",
        partsToRedact: "",
        sharingDecision: "",
        askingPermissionQuestions: true,
        askingPermissionFollowUpQuestions: false
      });
      this.props.navigation.setParams({ surveyProgress: _surveyProgress });
    } //no more permission question, ask data retention questions
    else {
      logger.info(
        codeFileName,
        "saveResponse",
        "Done with permission questions. Going to data retention questions."
      );
      await this.promisedSetState({
        askingPermissionQuestions: false,
        askingPermissionFollowUpQuestions: false,
        askingDataRetentionQuestions: true
      });
    }
  }

  async saveDataRetentionQuestionResponses() {
    /* 1. Check response validity and save them (if valid) to the questions asking about retention of conversation transcript.
       2. Go to the data retention length questions
    */

    // 1. Check validity
    const _allAnswered =
      this.state.dataRetentionTranscriptDecision.length > 0 && //data retention decision was made
      (this.state.dataRetentionTranscriptDecision !== "other" || //data retention decision != other
        this.state.dataRetentionTranscriptOtherText.length > 0); // OR explanation for 'other' was provided

    if (!_allAnswered) {
      Alert.alert(
        strings.ACCESS_SELECTION_REQUIRED_HEADER,
        strings.ACCESS_SELECTION_REQUIRED
      );
      logger.warn(
        codeFileName,
        "saveDataRetentionQuestionResponses",
        "Not all questions regarding data retention were answered, returning."
      );
      return;
    }

    // 2. Save response
    await this.promisedSetState(prevState => {
      const _surveyResponseJS = prevState.surveyResponseJS;
      _surveyResponseJS.dataRetentionTranscriptDecision =
        prevState.dataRetentionTranscriptDecision.length > 0
          ? prevState.dataRetentionTranscriptDecision
          : strings.EMPTY_STR;
      _surveyResponseJS.dataRetentionTranscriptOtherText =
        prevState.dataRetentionTranscriptOtherText.length > 0
          ? prevState.dataRetentionTranscriptOtherText
          : strings.EMPTY_STR;

      return { surveyResponseJS: _surveyResponseJS };
    });

    logger.info(
      codeFileName,
      "saveDataRetentionQuestionResponses",
      "Going to data retention length questions."
    );
    this.setState({
      askingDataRetentionQuestions: false,
      askingDataRetentionLengthQuestions: true
    });
  }

  async saveDataRetentionLengthQuestionResponses() {
    const funcName = "saveDataRetentionLengthQuestionResponses";
    /*
        Check response validity and save them (if valid) to the questions asking about retention length of conversation transcript.
    */
    const _allAnswered =
      this.state.dataRetentionLengthDecision.length > 0 && //data retention length decision was made
      (this.state.dataRetentionLengthDecision !== "specific_time" ||
        this.state.dataRetentionLengthSpecificText.length > 0) &&
      (this.state.dataRetentionLengthDecision !== "other" || //data retention length decision != other
        this.state.dataRetentionLengthOtherText.length > 0); // OR explanation for 'other' was provided

    if (!_allAnswered) {
      Alert.alert(
        strings.ACCESS_SELECTION_REQUIRED_HEADER,
        strings.ACCESS_SELECTION_REQUIRED
      );
      logger.warn(
        codeFileName,
        "saveDataRetentionLengthQuestionResponses",
        "Not all questions regarding data retention length were answered, returning."
      );
      return;
    }

    await this.promisedSetState(prevState => {
      const _surveyResponseJS = prevState.surveyResponseJS;
      _surveyResponseJS.dataRetentionLengthDecision =
        prevState.dataRetentionLengthDecision.length > 0
          ? prevState.dataRetentionLengthDecision
          : strings.EMPTY_STR;
      _surveyResponseJS.dataRetentionLengthSpecificText =
        prevState.dataRetentionLengthSpecificText.length > 0
          ? prevState.dataRetentionLengthSpecificText
          : strings.EMPTY_STR;
      _surveyResponseJS.dataRetentionLengthOtherText =
        prevState.dataRetentionLengthOtherText.length > 0
          ? prevState.dataRetentionLengthOtherText
          : strings.EMPTY_STR;

      return { surveyResponseJS: _surveyResponseJS };
    });

    //save response and go to the contextual questions page
    logger.info(
      codeFileName,
      "saveResponse",
      "Uploading partial response and going to ContextualQuestion page."
    );

    await this.promisedSetState({ saveWaitVisible: true });
    const _appStatus = await AppStatus.getStatus(codeFileName, funcName);
    utilities.uploadData(
      {
        SurveyID: _appStatus.CurrentSurveyID,
        Stage: "Permission complete.",
        PartialResponse: this.state.surveyResponseJS
      },
      _appStatus.UUID,
      "PartialSurveyResponse",
      codeFileName,
      "saveResponse",
      ServicePermissionScreen.fileUploadCallBack
    );

    //go to the contextual question page
    await this.promisedSetState({ saveWaitVisible: false });
    this.props.navigation.navigate("ContextualQuestion", {
      surveyResponseJS: this.state.surveyResponseJS,
      surveyProgress: 80
    });
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

  async saveResponse() {
    const funcName = "saveResponse";

    const _appStatus = await AppStatus.getStatus(codeFileName, funcName);
    if (await utilities.currentSurveyExpired(_appStatus)) {
      await this.expireSurvey(_appStatus);
      return;
    }

    if (
      this.state.askingPermissionQuestions ||
      this.state.askingPermissionFollowUpQuestions
    ) {
      await this.savePermissionQuestionResponses();
    } else if (this.state.askingDataRetentionQuestions) {
      await this.saveDataRetentionQuestionResponses();
    } else if (this.state.askingDataRetentionLengthQuestions) {
      await this.saveDataRetentionLengthQuestionResponses();
    }
  }

  flatListItemSeparator = () => {
    return (
      <View style={{ height: 0.5, width: "100%", backgroundColor: "grey" }} />
    );
  };

  radioListItemSeparator = () => {
    return <View />;
  };

  renderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender", margin: 5 }}
        onPress={() => {
          this.permissionSelectionChangedHandler(item);
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 2,
            justifyContent: "flex-start"
          }}
        >
          {item.key === this.state.sharingDecision && (
            <Icon
              name="radio-btn-active"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          {item.key !== this.state.sharingDecision && (
            <Icon
              name="radio-btn-passive"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}

          <View style={{ marginRight: 20 }}>
            <Text style={{ fontSize: 20 }}>{item.value}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderListItemDataRetentionTranscript = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender", margin: 5 }}
        onPress={() => {
          this.dataRetentionTranscriptSelectionChangedHandler(item);
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 2,
            justifyContent: "flex-start"
          }}
        >
          {item.key === this.state.dataRetentionTranscriptDecision && (
            <Icon
              name="radio-btn-active"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          {item.key !== this.state.dataRetentionTranscriptDecision && (
            <Icon
              name="radio-btn-passive"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}

          <View style={{ marginRight: 10 }}>
            <Text style={{ fontSize: 20, paddingRight: 10 }}>{item.value}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderListItemDataRetentionLength = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender", margin: 5 }}
        onPress={() => {
          this.dataRetentionLengthSelectionChangedHandler(item);
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 2,
            justifyContent: "flex-start"
          }}
        >
          {item.key === this.state.dataRetentionLengthDecision && (
            <Icon
              name="radio-btn-active"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          {item.key !== this.state.dataRetentionLengthDecision && (
            <Icon
              name="radio-btn-passive"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}

          <View style={{ marginRight: 10 }}>
            <Text style={{ fontSize: 20, paddingRight: 10 }}>{item.value}</Text>
          </View>
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
            alignItems: "center",
            marginRight: 10,
            marginLeft: 10,
            backgroundColor: "lavendar"
          }}
        >
          {this.state.askingPermissionQuestions &&
            this.state.services != null &&
            !this.state.askingPermissionFollowUpQuestions && (
              <View>
                <Text style={[commonStyle.questionStyle, { fontSize: 22 }]}>
                  {strings.WOULD_ALLOW_1}
                  <Text> &ldquo;</Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {this.state.services[
                      this.state.currentServiceIdx
                    ].serviceName
                      .trim()
                      .toLowerCase()}
                  </Text>
                  <Text>?&rdquo;</Text>
                </Text>

                <View style={commonStyle.listContainerStyle}>
                  <FlatList
                    data={this.permissionOptions}
                    ItemSeparatorComponent={this.flatListItemSeparator}
                    renderItem={this.renderListItem}
                    keyExtractor={(item, index) => index.toString()}
                    extraData={this.state}
                  />
                </View>
                <View style={commonStyle.buttonViewStyle}>
                  <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
                    <Button
                      onPress={() => {
                        if (this.state.sharingDecision.length === 0) {
                          Alert.alert(
                            strings.ACCESS_SELECTION_REQUIRED_HEADER,
                            strings.ACCESS_SELECTION_REQUIRED
                          );
                          logger.info(
                            codeFileName,
                            "NextButton.onPress",
                            "No permission option selected. Returning."
                          );
                          return;
                        }

                        //if fullShare, then do not show followup questions
                        //instead, save response and go to the next permission question
                        if (this.state.sharingDecision === fullShare) {
                          this.saveResponse();
                        } else {
                          this.setState({
                            askingPermissionQuestions: false,
                            askingPermissionFollowUpQuestions: true
                          });
                        }
                      }}
                      title={strings.NEXT_BUTTON}
                      color="#20B2AA"
                      accessibilityLabel="Next"
                    />
                  </TouchableHighlight>
                </View>
              </View>
            )}

          {this.state.askingPermissionFollowUpQuestions &&
            this.state.sharingDecision === partialShare && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={commonStyle.questionStyle}>
                  {strings.RESTRICT_WHICH}
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={commonStyle.inputStyle}
                  onChangeText={text => this.setState({ partsToRedact: text })}
                  value={this.state.partsToRedact}
                />

                <Text style={commonStyle.questionStyle}>
                  {strings.RESTRICT_WHY}
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={commonStyle.inputStyle}
                  onChangeText={text => this.setState({ whyPartShare: text })}
                  value={this.state.whyPartShare}
                />
              </View>
            )}
          {this.state.askingPermissionFollowUpQuestions &&
            this.state.sharingDecision === noShare && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={commonStyle.questionStyle}>
                  {strings.WHY_DENY}
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={commonStyle.inputStyle}
                  onChangeText={text => this.setState({ whyNoShare: text })}
                  value={this.state.whyNoShare}
                />
              </View>
            )}
        </View>

        {this.state.askingDataRetentionQuestions && (
          <View style={commonStyle.dividerStyle}>
            <Text style={commonStyle.questionStyle}>
              {strings.DATA_RETENTION_QUESTION_TRANSCRIPT}
            </Text>
            <View style={commonStyle.listContainerStyle}>
              <FlatList
                data={this.dataRetentionTranscriptOptions}
                ItemSeparatorComponent={this.radioListItemSeparator}
                renderItem={this.renderListItemDataRetentionTranscript}
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
              />
            </View>
          </View>
        )}
        {this.state.askingDataRetentionLengthQuestions && (
          <View style={[commonStyle.dividerStyle]}>
            <Text style={commonStyle.questionStyle}>
              {strings.DATA_RETENTION_QUESTION_LENGTH}
            </Text>
            <View style={commonStyle.listContainerStyle}>
              <FlatList
                data={this.dataRetentionLengthOptions}
                ItemSeparatorComponent={this.radioListItemSeparator}
                renderItem={this.renderListItemDataRetentionLength}
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
              />
            </View>
          </View>
        )}

        {!this.state.askingPermissionQuestions && (
          <View style={commonStyle.buttonViewStyle}>
            <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
              <Button
                onPress={() => {
                  this.saveResponse();
                }}
                title={strings.NEXT_BUTTON}
                color="#20B2AA"
                accessibilityLabel="Next"
              />
            </TouchableHighlight>
          </View>
        )}

        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title={strings.SAVING_HEADER}
          message={strings.SAVING_WAIT}
        />

        <DialogInput
          isDialogVisible={this.state.dataRetentionTranscriptDialogVisible}
          title={strings.PLEASE_EXPLAIN}
          multiline
          numberOfLines={4}
          submitInput={async inputText => {
            logger.info(
              codeFileName,
              "dataRetentionTranscriptDialog.Submit",
              "Entered: " + inputText
            );

            if (inputText.length > 0) {
              await this.promisedSetState({
                dataRetentionTranscriptOtherText: inputText,
                dataRetentionTranscriptDialogVisible: false
              });
            }
          }}
          closeDialog={async () => {
            await this.promisedSetState({
              dataRetentionTranscriptDecision: "",
              dataRetentionTranscriptOtherText: "",
              dataRetentionTranscriptDialogVisible: false
            });
          }}
        />

        <DialogInput
          isDialogVisible={this.state.dataRetentionLengthOtherDialogVisible}
          title={strings.PLEASE_EXPLAIN}
          multiline
          numberOfLines={4}
          submitInput={async inputText => {
            logger.info(
              codeFileName,
              "dataRetentionLengthOtherDialogVisible.Submit",
              "Entered: " + inputText
            );

            if (inputText.length > 0) {
              await this.promisedSetState({
                dataRetentionLengthOtherText: inputText,
                dataRetentionLengthOtherDialogVisible: false
              });
            }
          }}
          closeDialog={() => {
            this.setState({
              dataRetentionLengthOtherText: "",
              dataRetentionLengthDecision: "",
              dataRetentionLengthOtherDialogVisible: false
            });
          }}
        />

        <DialogInput
          isDialogVisible={this.state.dataRetentionLengthSpecificDialogVisible}
          title={strings.EXPLAIN_SPECIFIC_RETENTION_POLICY}
          multiline
          numberOfLines={4}
          submitInput={async inputText => {
            logger.info(
              codeFileName,
              "dataRetentionLengthSpecificDialogVisible.Submit",
              "Entered: " + inputText
            );

            if (inputText.length > 0) {
              await this.promisedSetState({
                dataRetentionLengthSpecificText: inputText,
                dataRetentionLengthSpecificDialogVisible: false
              });
            }
          }}
          closeDialog={() => {
            this.setState({
              dataRetentionLengthSpecificText: "",
              dataRetentionLengthDecision: "",
              dataRetentionLengthSpecificDialogVisible: false
            });
          }}
        />
      </ScrollView>
    );
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "ServicePermission") {
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
}

ServicePermissionScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
};
