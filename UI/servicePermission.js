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
import PropTypes from "prop-types";
import * as RNFS from "react-native-fs";
import { ProgressDialog } from "react-native-simple-dialogs";
import Icon from "react-native-vector-icons/Fontisto";
import commonStyle from "./Style";
import logger from "../controllers/logger";
import utilities from "../controllers/utilities";
import ToolBar from "./toolbar";
import appStatus from "../controllers/appStatus";
import {
  ANSWER_TO_CONTINUE,
  RESTRICT_WHICH,
  WHY_DENY,
  SAVING_WAIT,
  WOULD_ALLOW_1,
  RESTRICT_WHY
} from "../controllers/strings";

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
      followUpQuestions: false
    };

    this.permissionOptions = [
      {
        key: fullShare,
        value: (
          <View style={{ flex: 0 }}>
            <Text style={{ fontSize: 20, marginRight: 5 }}>
              Yes, I would
              <Text style={{ fontWeight: "bold" }}> allow access</Text>
              <Text> to any relevant parts of the conversation.</Text>
            </Text>
          </View>
        )
      },
      {
        key: partialShare,
        value: (
          <View style={{ flex: 0 }}>
            <Text style={{ fontSize: 20, marginRight: 5 }}>
              I would
              <Text style={{ fontWeight: "bold" }}> partially restrict </Text>
              <Text>access to</Text>
              <Text style={{ fontWeight: "bold" }}> certain parts </Text>
              <Text>of the relevant conversation.</Text>
            </Text>
          </View>
        )
      },
      {
        key: noShare,
        value: (
          <View style={{ flex: 0 }}>
            <Text style={{ fontSize: 20, marginRight: 5 }}>
              No, I would
              <Text style={{ fontWeight: "bold" }}> deny </Text>
              <Text>access to</Text>
              <Text style={{ fontWeight: "bold" }}> any </Text>
              <Text>relevant part of the conversation.</Text>
            </Text>
          </View>
        )
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
    const { navigation } = this.props;
    const _services = navigation.getParam("services", null);
    const _surveyProgress = navigation.getParam("surveyProgress", 0);
    const _surveyResponseJS = navigation.getParam("surveyResponseJS", null);

    await this.promisedSetState({
      services: _services,
      surveyProgress: _surveyProgress,
      surveyResponseJS: _surveyResponseJS
    });

    if (Platform.OS === "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid.bind(this)
      );
    }
  }

  fileUploadCallBack(success, error = null, data = null) {
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload partial response, erro: ${error}. Stage:Permission complete. Saving in file: ${data !=
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

  permissionSelectionChangedHandler = async item => {
    this.setState({ sharingDecision: item.key });
  };

  async saveResponse() {
    if (this.state.sharingDecision.length === 0) {
      Alert.alert("Error", "Please select an option to continue.");
      logger.info(
        codeFileName,
        "saveResponse",
        "No permission option selected. Returning"
      );
      return;
    }

    logger.info(
      codeFileName,
      "saveResponse",
      `service:${this.state.services[this.state.currentServiceIdx].serviceName}, sharingDecision:${this.state.sharingDecision}`
    );

    if (this.state.sharingDecision === partialShare) {
      if (
        this.state.whyPartShare.length === 0 ||
        this.state.partsToRedact.length === 0
      ) {
        Alert.alert("Error", ANSWER_TO_CONTINUE);
        logger.info(
          codeFileName,
          "saveResponse",
          "Not all questions regarding partial share is answered. Returning"
        );
        return;
      }
    }
    if (this.state.sharingDecision === noShare) {
      if (this.state.whyNoShare.length === 0) {
        Alert.alert("Error", ANSWER_TO_CONTINUE);
        logger.info(
          codeFileName,
          "saveResponse",
          "Not all questions regarding no share is answered. Returning"
        );
        return;
      }
    }

    const _permissionResponse = {
      ServiceCategory: this.state.services[this.state.currentServiceIdx]
        .categoryName,
      ServiceName: this.state.services[this.state.currentServiceIdx]
        .serviceName,
      Sharing: this.state.sharingDecision,
      PartsToRedact: this.state.partsToRedact,
      WhyPartShare: this.state.whyPartShare,
      WhyNoShare: this.state.whyNoShare
    };

    const _permissionResponses = this.state.permissionResponses;
    _permissionResponses.push(_permissionResponse);
    const _surveyResponseJS = this.state.surveyResponseJS;
    _surveyResponseJS.PermissionResponses = _permissionResponses;

    const _nextServiceIdx = this.state.currentServiceIdx + 1;
    if (_nextServiceIdx < this.state.services.length) {
      //more services remaining
      logger.info(
        codeFileName,
        "saveResponse",
        "Saving response and going to the next service."
      );
      const _surveyProgress =
        this.state.surveyProgress + Math.floor(40 / this.state.services.length);
      await this.promisedSetState({
        surveyResponseJS: _surveyResponseJS,
        currentServiceIdx: _nextServiceIdx,
        surveyProgress: _surveyProgress,
        whyNoShare: "",
        whyPartShare: "",
        partsToRedact: "",
        sharingDecision: "",
        followUpQuestions: false
      });
      this.props.navigation.setParams({ surveyProgress: _surveyProgress });
    } //no more service, save and upload permission responses
    else {
      logger.info(
        codeFileName,
        "saveResponse",
        "Uploading partial response and going to ContextualQuestion page."
      );
      //upload partial survey response
      {
        await this.promisedSetState({ saveWaitVisible: true });
        const _appStatus = await appStatus.loadStatus();
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
          this.fileUploadCallBack.bind(this)
        );
      }

      //go to the contextual question page
      await this.promisedSetState({ saveWaitVisible: false });
      this.props.navigation.navigate("ContextualQuestion", {
        surveyResponseJS: this.state.surveyResponseJS,
        surveyProgress: 80
      });
    }
  }

  flatListItemSeparator = () => {
    return (
      <View style={{ height: 0.5, width: "100%", backgroundColor: "grey" }} />
    );
  };

  renderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender", margin: 5 }}
        onPress={this.permissionSelectionChangedHandler.bind(this, item)}
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

          {item.value}
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
            alignItems: "center",
            marginRight: 10,
            marginLeft: 10,
            backgroundColor: "lavendar"
          }}
        >
          {!this.state.followUpQuestions && this.state.services != null && (
            <View>
              <Text style={[commonStyle.questionStyle, { fontSize: 22 }]}>
                {WOULD_ALLOW_1}
                <Text> {'"'}</Text>
                <Text style={{ fontWeight: "bold" }}>
                  {this.state.services[this.state.currentServiceIdx].serviceName
                    .trim()
                    .toLowerCase()}
                </Text>
                <Text>{'"'}?</Text>
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
                      if (this.state.sharingDecision === fullShare) {
                        this.saveResponse();
                      } else {
                        this.setState({ followUpQuestions: true });
                      }
                    }}
                    title="Next"
                    color="#20B2AA"
                    accessibilityLabel="Next"
                  />
                </TouchableHighlight>
              </View>
            </View>
          )}

          {this.state.followUpQuestions &&
            this.state.sharingDecision === partialShare && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={commonStyle.questionStyle}>{RESTRICT_WHICH}</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={commonStyle.inputStyle}
                  onChangeText={text => this.setState({ partsToRedact: text })}
                  value={this.state.partsToRedact}
                />

                <Text style={commonStyle.questionStyle}>{RESTRICT_WHY}</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={commonStyle.inputStyle}
                  onChangeText={text => this.setState({ whyPartShare: text })}
                  value={this.state.whyPartShare}
                />
              </View>
            )}
          {this.state.followUpQuestions &&
            this.state.sharingDecision === noShare && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={commonStyle.questionStyle}>{WHY_DENY}</Text>
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

        {this.state.followUpQuestions && (
          <View style={commonStyle.buttonViewStyle}>
            <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
              <Button
                onPress={() => {
                  this.saveResponse();
                }}
                title="Next"
                color="#20B2AA"
                accessibilityLabel="Next"
              />
            </TouchableHighlight>
          </View>
        )}

        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title="MiMi"
          message={SAVING_WAIT}
        />
      </ScrollView>
    );
  }

  componentWillUnmount() {
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      );
    }
  }

  onBackButtonPressAndroid = () => {
    return true;
  };
}

ServicePermissionScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
};
