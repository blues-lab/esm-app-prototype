import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Switch,
  BackHandler
} from "react-native";
import * as RNFS from "react-native-fs";
import Icon from "react-native-vector-icons/Fontisto";
import { ProgressDialog } from "react-native-simple-dialogs";

import commonStyle from "./Style";
import { RadioButton } from "react-native-paper";

import {
  EXIT_SURVEY_CONSENT,
  MODEL1_FEATURES,
  MODEL2_FEATURES,
  SINGLE_MODEL_INTRO_TEXT,
  BOTH_MODEL_INTRO_TEXT,
  EXPLAIN_WHY_NO_SERVICES
} from "../controllers/strings.js";

import logger from "../controllers/logger";

import appStatus from "../controllers/appStatus";

const codeFileName = "exitSurvey.js";

import utilities from "../controllers/utilities";
import { SELECTED_SERVICES_FILE } from "../controllers/constants";

const usefulnessOptions = [
  "Not useful at all",
  "Slightly useful",
  "Moderately useful",
  "Useful",
  "Very useful"
];

export default class ExitSurveyScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: "Exit survey"
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      usefulness: "",
      curServiceIdx: 0,
      serviceQuestions: false,
      noServiceQuestions: false,
      priceQuestions: false,
      priceCondition: 0,
      selectedServices: [],
      serviceResponses: [], //holds responses to the service usefulness questions
      saveWaitVisible: false, //show progress dialog while saving survey response
      model1Price: "",
      model2Price: "",
      whyNoService: ""
    };
  }

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  async loadSelectedServices() {
    _selectedServices = new Set([]);

    try {
      if (await RNFS.exists(SELECTED_SERVICES_FILE)) {
        logger.info(
          codeFileName,
          "loadSelectedServices",
          "Loading selected services."
        );
        const _fileContents = await RNFS.readFile(SELECTED_SERVICES_FILE);
        const _lines = _fileContents.split("\n");

        for (i = 0; i < _lines.length; i++) {
          if (_lines[i].trim().length > 0) {
            try {
              const _js = JSON.parse(_lines[i]);

              for (j = 0; j < _js.length; j++) {
                for (s = 0; s < _js[j].services.length; s++) {
                  _selectedServices = new Set(this.state.selectedServices);
                  _selectedServices.add(_js[j].services[s]);
                  await this.promisedSetState({
                    selectedServices: Array.from(_selectedServices)
                  });
                }
              }
            } catch (error) {
              logger.error(
                codeFileName,
                "loadSelectedServices",
                "Failed to parse line:" +
                  _lines[i] +
                  ". Error:+" +
                  error.message
              );
            }
          }
        }
      } else {
        logger.warn(
          codeFileName,
          "loadSelectedServices",
          "No file found for selected services."
        );
      }
    } catch (error) {
      logger.error(
        codeFileName,
        "loadSelectedServices",
        "Failed to load services:" + error.message
      );
    }

    this.setState({
      serviceQuestions: this.state.selectedServices.length > 0,
      noServiceQuestions: this.state.selectedServices.length == 0
    });
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Adding event handlers.");
    if (Platform.OS == "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid.bind(this)
      );
    }

    await this.loadSelectedServices();
  }

  onBackButtonPressAndroid = () => {
    return true; //make it false to enable going back
  };

  componentWillUnmount() {
    logger.info(
      codeFileName,
      "componentWillUnmount",
      "Removing event handlers."
    );
    if (Platform.OS == "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      );
    }
  }

  saveResponse() {
    logger.info(codeFileName, "saveResponse", "Saving exit survey response.");

    appStatus.loadStatus().then(_appStatus => {
      this.setState({ saveWaitVisible: true });

      _response = {
        serviceResponses: this.state.serviceResponses,
        whyNoService: this.state.whyNoService,
        priceCondition: this.state.priceCondition,
        model1Price: this.state.model1Price,
        model2Price: this.state.model2Price,
        CompletionTime: new Date(),
        UIID: _appStatus.UIID
      };

      logger.info(
        codeFileName,
        "saveResponse",
        "Uploading exit survey response to the server:" +
          JSON.stringify(_response)
      );
      utilities
        .uploadData(
          {
            SurveyID: "Exit survey",
            Stage: "Completed.",
            Response: _response
          },
          _appStatus.UUID,
          "ExitSurveyResponse",
          codeFileName,
          "saveResponse"
        )
        .then(_uploaded => {
          if (_uploaded) {
            logger.info(
              codeFileName,
              "saveResponse",
              "Uploading exit survey response done!"
            );
          } else {
            logger.error(
              codeFileName,
              "saveResponse",
              "Failed to upload exit survey response. Saving in local file for now."
            );
            _time = Date.now().toString();
            utilities.writeJSONFile(
              _response,
              RNFS.DocumentDirectoryPath + "/exit-survey-response.js",
              codeFileName,
              "saveResponse"
            );
          }
        });

      logger.info(codeFileName, "saveResponse", "Updating app status.");

      _appStatus.ExitSurveyDone = true;
      appStatus.setAppStatus(_appStatus).then();
      {
        this.setState({ saveWaitVisible: false }, () => {
          Alert.alert(
            "Congratulations!",
            "You have earned $1!!!",
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
    });
  }

  isNumeric(num) {
    num = "" + num; //coerce num to be a string
    return !isNaN(num) && !isNaN(parseFloat(num));
  }

  handleUsefulnessSelection = async item => {
    logger.info(
      codeFileName,
      "handleUsefulnessSelection",
      "Service:" +
        this.state.selectedServices[this.state.curServiceIdx] +
        ", usefulness:" +
        item
    );
    this.setState({ usefulness: item });
  };

  handleNextButtonPress = () => {
    logger.info(
      codeFileName,
      "handleNextButtonPress",
      "Service question?:" +
        this.state.serviceQuestions +
        ", No service questions?:" +
        this.state.noServiceQuestions +
        ", priceQuestion?:" +
        this.state.priceQuestions
    );

    if (this.state.serviceQuestions) {
      if (this.state.usefulness == "") {
        logger.warn(
          codeFileName,
          "handleNextButtonPress",
          "No usefulness option was selected. Showing error message."
        );
        Alert.alert("Error", "Please select an option to continue.");
        return;
      }

      const _curServiceIdx = this.state.curServiceIdx;
      const _curService = this.state.selectedServices[_curServiceIdx];
      const _response = this.state.usefulness;
      logger.info(
        codeFileName,
        "handleNextButtonPress",
        "Current service:" + _curService + ", usefulness:" + _response
      );

      _serviceResponses = this.state.serviceResponses;
      _serviceResponses.push({ [_curService]: _response });
      this.setState({
        serviceResponses: _serviceResponses,
        usefulness: ""
      });
      if (_curServiceIdx < this.state.selectedServices.length - 1) {
        logger.info(
          codeFileName,
          "handleNextButtonPress",
          "Advancing to the next service usefulness question"
        );
        this.setState({ curServiceIdx: _curServiceIdx + 1 });
      } else {
        const _priceCondition = Math.floor(Math.random() * 2);
        logger.info(
          codeFileName,
          "handleNextButtonPress",
          "All service usefulness questions are done. Going to price question with condition:" +
            _priceCondition
        );
        this.setState({
          priceCondition: _priceCondition,
          serviceQuestions: false,
          noServiceQuestions: false,
          priceQuestions: true
        });
      }
    } else if (this.state.noServiceQuestions) {
      if (this.state.whyNoService.trim().length == 0) {
        logger.warn(
          codeFileName,
          "handleNextButtonPress",
          'whyNoService:"' +
            this.state.whyNoService +
            '". Showing error message.'
        );
        Alert.alert("Error", "Please answer the questions to continue.");
      } else {
        const _priceCondition = Math.floor(Math.random() * 2);
        logger.info(
          codeFileName,
          "handleNextButtonPress",
          "Going to price question with condition:" + _priceCondition
        );
        this.setState({
          priceCondition: _priceCondition,
          serviceQuestions: false,
          noServiceQuestions: false,
          priceQuestions: true
        });
      }
    } else if (this.state.priceQuestions) {
      if (
        this.state.priceCondition == 0 &&
        (this.state.model1Price.trim().length == 0 ||
          !this.isNumeric(this.state.model1Price))
      ) {
        logger.warn(
          codeFileName,
          "handleNextButtonPress",
          "Invalid value entered for price:" +
            this.state.model1Price +
            ". Showing error message"
        );
        Alert.alert("Error", "Please enter a valid numeric value to continue.");
        return;
      } else if (
        this.state.priceCondition == 1 &&
        (this.state.model2Price.trim().length == 0 ||
          !this.isNumeric(this.state.model2Price))
      ) {
        logger.warn(
          codeFileName,
          "handleNextButtonPress",
          "Invalid value entered for price:" +
            this.state.model2Price +
            ". Showing error message"
        );
        Alert.alert("Error", "Please enter a valid numeric value to continue.");
        return;
      } else if (
        this.state.priceCondition == 2 &&
        (this.state.model1Price.trim().length == 0 ||
          !this.isNumeric(this.state.model1Price) ||
          this.state.model2Price.trim().length == 0 ||
          !this.isNumeric(this.state.model2Price))
      ) {
        logger.warn(
          codeFileName,
          "handleNextButtonPress",
          "Invalid value entered for price:" +
            this.state.model1Price +
            "," +
            this.state.model2Price +
            ". Showing error message"
        );
        Alert.alert(
          "Error",
          "Please enter a valid numeric values to continue."
        );
        return;
      }

      logger.info(
        codeFileName,
        "handleNextButtonPress",
        "All good. Going to saveResponse."
      );

      //save response
      {
        logger.info(
          codeFileName,
          "saveResponse",
          "Saving exit survey response."
        );

        appStatus.loadStatus().then(_appStatus => {
          this.setState({ saveWaitVisible: true });

          _response = {
            serviceResponses: this.state.serviceResponses,
            whyNoService: this.state.whyNoService,
            priceCondition: this.state.priceCondition,
            model1Price: this.state.model1Price,
            model2Price: this.state.model2Price,
            CompletionTime: new Date(),
            UIID: _appStatus.UIID
          };

          logger.info(
            codeFileName,
            "saveResponse",
            "Uploading exit survey response to the server:" +
              JSON.stringify(_response)
          );
          utilities
            .uploadData(
              {
                SurveyID: "Exit survey",
                Stage: "Completed.",
                Response: _response
              },
              _appStatus.UUID,
              "ExitSurveyResponse",
              codeFileName,
              "saveResponse"
            )
            .then(_uploaded => {
              if (_uploaded) {
                logger.info(
                  codeFileName,
                  "saveResponse",
                  "Uploading exit survey response done!"
                );
              } else {
                logger.error(
                  codeFileName,
                  "saveResponse",
                  "Failed to upload exit survey response. Saving in local file for now."
                );
                _time = Date.now().toString();
                utilities.writeJSONFile(
                  _response,
                  RNFS.DocumentDirectoryPath + "/exit-survey-response.js",
                  codeFileName,
                  "saveResponse"
                );
              }
            });

          logger.info(codeFileName, "saveResponse", "Updating app status.");

          _appStatus.ExitSurveyDone = true;
          appStatus.setAppStatus(_appStatus).then();
          {
            this.setState({ saveWaitVisible: false }, () => {
              Alert.alert(
                "Congratulations!",
                "You have earned $1!!!",
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
        });
      }
    }
  };

  renderListItemUsefulness = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender" }}
        onPress={this.handleUsefulnessSelection.bind(this, item)}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 2,
            justifyContent: "flex-start"
          }}
        >
          {item == this.state.usefulness && (
            <Icon
              name="radio-btn-active"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          {item != this.state.usefulness && (
            <Icon
              name="radio-btn-passive"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}

          <Text style={{ fontSize: 18 }}>{item}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  flatListItemSeparator = () => {
    return (
      <View style={{ height: 0, width: "100%", backgroundColor: "grey" }} />
    );
  };
  renderListItem = ({ item }) => {
    return <Text style={{ fontSize: 18 }}>{item}</Text>;
  };

  getModelText(model) {
    if (model == 2) {
      return (
        <View>
          <Text style={{ fontSize: 20 }}> {BOTH_MODEL_INTRO_TEXT}</Text>
          <Text style={{ fontSize: 20 }}>
            To provide them, in
            <Text style={{ fontWeight: "bold" }}> Model 1</Text>, audio
            recordings are:{" "}
          </Text>
          <View style={commonStyle.listContainerStyle}>
            <FlatList
              data={MODEL1_FEATURES}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          <Text style={{ fontSize: 20 }}>
            {"\n"}To provide the similar services, in
            <Text style={{ fontWeight: "bold" }}> Model 2</Text>, audio
            recordings are:{" "}
          </Text>
          <View style={commonStyle.listContainerStyle}>
            <FlatList
              data={MODEL2_FEATURES}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      );
    } else {
      model_features = MODEL1_FEATURES;
      if (model == 1) {
        model_features = MODEL2_FEATURES;
      }
      return (
        <View>
          <Text style={{ fontSize: 20 }}> {SINGLE_MODEL_INTRO_TEXT}</Text>
          <View style={commonStyle.listContainerStyle}>
            <FlatList
              data={model_features}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      );
    }
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        {this.state.serviceQuestions && (
          <View style={styles.verticalViewStyle}>
            <Text style={[commonStyle.questionStyle]}>
              <Text>How useful is</Text>
              <Text>
                {' "'}
                {this.state.selectedServices[this.state.curServiceIdx]
                  .trim()
                  .toLowerCase()}
                {'" '}
              </Text>
              <Text>to you?</Text>
            </Text>

            <View style={commonStyle.listContainerStyle}>
              <FlatList
                data={usefulnessOptions}
                ItemSeparatorComponent={this.flatListItemSeparator}
                renderItem={this.renderListItemUsefulness}
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
              />
            </View>
          </View>
        )}

        {this.state.noServiceQuestions && (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: 10
            }}
          >
            <Text style={commonStyle.questionStyle}>
              {EXPLAIN_WHY_NO_SERVICES}
            </Text>
            <TextInput
              multiline={true}
              numOfLines={5}
              style={commonStyle.inputStyle}
              onChangeText={text => this.setState({ whyNoService: text })}
              value={this.state.whyNoService}
            />
          </View>
        )}

        {this.state.priceQuestions && this.state.priceCondition == 0 && (
          <View style={{ margin: 10 }}>
            {this.getModelText(this.state.priceCondition)}

            <Text style={{ fontSize: 20 }}>
              What is the maximum price you would be willing to pay for this
              device?{"\n"}
            </Text>
            <View style={commonStyle.horizontalViewStyle}>
              <Text style={{ fontSize: 20 }}> USD </Text>
              <TextInput
                multiline={false}
                keyboardType="numeric"
                style={{
                  backgroundColor: "white",
                  borderColor: "gray",
                  borderWidth: 0.5,
                  height: 35,
                  width: 100,
                  textAlignVertical: "top"
                }}
                onChangeText={text => this.setState({ model1Price: text })}
                value={this.state.model1Price}
              />
            </View>
          </View>
        )}

        {this.state.priceQuestions && this.state.priceCondition == 1 && (
          <View style={{ margin: 10 }}>
            {this.getModelText(this.state.priceCondition)}
            <Text style={{ fontSize: 20 }}>
              What is the maximum price you would be willing to pay for this
              device?{"\n"}
            </Text>
            <View style={commonStyle.horizontalViewStyle}>
              <Text style={{ fontSize: 20 }}> USD </Text>
              <TextInput
                multiline={false}
                keyboardType="numeric"
                style={{
                  backgroundColor: "white",
                  borderColor: "gray",
                  borderWidth: 0.5,
                  height: 35,
                  width: 100,
                  textAlignVertical: "top"
                }}
                onChangeText={text => this.setState({ model2Price: text })}
                value={this.state.model2Price}
              />
            </View>
          </View>
        )}

        {this.state.priceQuestions && this.state.priceCondition == 2 && (
          <View style={{ margin: 10 }}>
            {this.getModelText(this.state.priceCondition)}

            <Text style={{ fontSize: 20 }}>
              What is the maximum price you would be willing to pay for each of
              the models?
            </Text>
            <View style={commonStyle.horizontalViewStyle}>
              <Text style={{ fontSize: 20 }}> Model 1: USD </Text>
              <TextInput
                multiline={false}
                keyboardType="numeric"
                style={{
                  backgroundColor: "white",
                  marginBottom: 5,
                  borderColor: "gray",
                  borderWidth: 1.5,
                  height: 35,
                  width: 100,
                  textAlignVertical: "top"
                }}
                onChangeText={text => this.setState({ model1Price: text })}
                value={this.state.model1Price}
              />
            </View>
            <View style={commonStyle.horizontalViewStyle}>
              <Text style={{ fontSize: 20 }}> Model 2: USD </Text>
              <TextInput
                multiline={false}
                keyboardType="numeric"
                style={{
                  backgroundColor: "white",
                  borderColor: "gray",
                  borderWidth: 1.5,
                  height: 35,
                  width: 100,
                  textAlignVertical: "top"
                }}
                onChangeText={text => this.setState({ model2Price: text })}
                value={this.state.model2Price}
              />
            </View>
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
            <Button
              onPress={this.handleNextButtonPress}
              title="Next"
              color="#20B2AA"
              accessibilityLabel="Save"
            />
          </TouchableHighlight>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  verticalViewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "flex-start"
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
