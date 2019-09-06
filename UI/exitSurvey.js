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
  Switch,
  BackHandler
} from "react-native";
import * as RNFS from "react-native-fs";

import { ProgressDialog } from "react-native-simple-dialogs";

import commonStyle from "./Style";
import { RadioButton } from "react-native-paper";

import { EXIT_SURVEY_CONSENT } from "../controllers/strings.js";

import logger from "../controllers/logger";

import appStatus from "../controllers/appStatus";

const codeFileName = "exitSurvey.js";

import utilities from "../controllers/utilities";
import { SELECTED_SERVICES_FILE } from "../controllers/constants";

const notUseful = "notUseful";
const slightUseful = "slightUseful";
const moderateUseful = "moderateUseful";
const useful = "useful";
const veryUseful = "veryUseful";

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
      value: -1,
      curServiceIdx: 0,
      consent: true,
      serviceQuestions: false,
      priceQuestions: false,
      priceCondition: 0,
      selectedServices: [],
      serviceResponses: [], //holds responses to the service usefulness questions
      saveWaitVisible: false, //show progress dialog while saving survey response
      model1Price: "",
      model2Price: ""
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
  }

  async componentDidMount() {
    if (Platform.OS == "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid.bind(this)
      );
    }

    await this.loadSelectedServices();

    //Alert.alert("Selected",JSON.stringify(this.state.selectedServices));
  }

  onBackButtonPressAndroid = () => {
    return true; //make it false to enable going back
  };

  componentWillUnmount() {
    if (Platform.OS == "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      );
    }
  }

  async saveResponse() {
    this.setState({ saveWaitVisible: true });

    _appStatus = await appStatus.loadStatus();

    _response = {
      serviceResponses: this.state.serviceResponses,
      priceCondition: this.state.priceCondition,
      model1Price: this.state.model1Price,
      model2Price: this.state.model2Price,
      CompletionTime: new Date(),
      UIID: _appStatus.UIID
    };

    logger.info(
      codeFileName,
      "saveResponse",
      "Uploading exit survey response to the server."
    );
    const _uploaded = await utilities.uploadData(
      {
        SurveyID: "Exit survey",
        Stage: "Completed.",
        Response: _response
      },
      _appStatus.UUID,
      "ExitSurveyResponse",
      codeFileName,
      "saveResponse"
    );
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
      await utilities.writeJSONFile(
        _response,
        RNFS.DocumentDirectoryPath + "/exit-survey-response.js",
        codeFileName,
        "saveResponse"
      );
    }

    logger.info(codeFileName, "saveResponse", "Updating app status.");

    _appStatus.ExitSurveyDone = true;
    await appStatus.setAppStatus(_appStatus);

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

  isNumeric(num) {
    num = "" + num; //coerce num to be a string
    return !isNaN(num) && !isNaN(parseFloat(num));
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        {this.state.consent && (
          <View
            style={{
              flex: 1,
              marginTop: 20,
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Text style={{ fontSize: 20, margin: 10 }}>
              {EXIT_SURVEY_CONSENT}
            </Text>
            <Text> {"\n"} </Text>
            <TouchableHighlight style={commonStyle.buttonTouchHLStyle}>
              <Button
                onPress={() => {
                  if (this.state.selectedServices.length > 0) {
                    this.setState({ serviceQuestions: true, consent: false });
                  } else {
                    this.setState({ priceQuestions: true, consent: false });
                  }
                }}
                title="I consent"
                color="#20B2AA"
                accessibilityLabel="Save"
              />
            </TouchableHighlight>
          </View>
        )}

        {this.state.serviceQuestions && this.state.selectedServices.length > 0 && (
          <View style={styles.verticalViewStyle}>
            <Text style={[commonStyle.questionStyle]}>
              <Text>How useful is</Text>
              <Text>
                {" "}
                "{this.state.selectedServices[this.state.curServiceIdx]}"{" "}
              </Text>
              <Text>to you?</Text>
            </Text>

            <RadioButton.Group
              onValueChange={value => this.setState({ value })}
              value={this.state.value}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <RadioButton value={notUseful} />
                <Text style={{ fontSize: 20 }}>Not useful at all</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <RadioButton value={slightUseful} />
                <Text style={{ fontSize: 20 }}>Slightly useful</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <RadioButton value={useful} />
                <Text style={{ fontSize: 20 }}>Useful</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <RadioButton value={moderateUseful} />
                <Text style={{ fontSize: 20 }}>Moderately useful</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <RadioButton value={veryUseful} />
                <Text style={{ fontSize: 20 }}>Very useful</Text>
              </View>
            </RadioButton.Group>
          </View>
        )}

        {this.state.priceQuestions && this.state.priceCondition == 0 && (
          <View style={{ margin: 10 }}>
            <Text style={{ fontSize: 20 }}>
              Suppose you could actually buy a real version of MiMi, which
              offered the services you suggested during the past week. It would
              also have the following features:
              <Text style={{ fontSize: 18 }}>
                {"\n"}• Uses audio recordings to provide the relevant services{" "}
                {"\n"}• Stores the audio recording until the relevant service is
                provided {"\n"}• Processes and analyzes audio recordings
                directly on the device{"\n"}• Audio recordings are processed and
                analyzed by algorithms{"\n"}
              </Text>
            </Text>

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
            <Text style={{ fontSize: 20 }}>
              Suppose you could actually buy a real version of MiMi, which
              offered the services you suggested during the past week. It would
              also have the following features:{"\n"}
              <Text style={{ fontSize: 18 }}>
                • Uses audio recordings to provide the relevant services and
                personalized offers from companies other than the manufacturer
                of the device{"\n"}• Stores the audio recording forever {"\n"}•
                Processes and analyzes audio recordings after being sent over
                the Internet to the manufacturer’s server{"\n"}• Audio
                recordings are processed and analyzed by humans {"\n"}
              </Text>
            </Text>
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
            <Text style={{ fontSize: 20 }}>
              Suppose you could actually buy a real version of MiMi, which
              offered the services you suggested during the past week. Imagine
              there are two models of MiMi. Model 1 has the following features:
              {"\n"}
              <Text style={{ fontSize: 18 }}>
                • Uses audio recordings to provide the relevant services {"\n"}•
                Stores the audio recording until the relevant service is
                provided {"\n"}• Processes and analyzes audio recordings
                directly on the device{"\n"}• Audio recordings are processed and
                analyzed by algorithms{"\n"}
              </Text>
              {"\n"}And model 2 has the following features:{"\n"}
              <Text style={{ fontSize: 18 }}>
                • Uses audio recordings to provide the relevant services and
                personalized offers from companies other than the manufacturer
                of the device{"\n"}• Stores the audio recording forever {"\n"}•
                Processes and analyzes audio recordings after being sent over
                the Internet to the manufacturer’s server{"\n"}• Audio
                recordings are processed and analyzed by humans {"\n"}
              </Text>
            </Text>
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

        {!this.state.consent && (
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
                onPress={() => {
                  if (this.state.serviceQuestions) {
                    if (this.state.value == -1) {
                      Alert.alert(
                        "Error",
                        "Please select an option to continue."
                      );
                      return;
                    }

                    const _curServiceIdx = this.state.curServiceIdx;
                    const _curService = this.state.selectedServices[
                      _curServiceIdx
                    ];
                    const _response = this.state.value;
                    _serviceResponses = this.state.serviceResponses;
                    _serviceResponses.push({ [_curService]: _response });
                    this.setState({
                      serviceResponses: _serviceResponses,
                      value: -1
                    });
                    if (
                      _curServiceIdx <
                      this.state.selectedServices.length - 1
                    ) {
                      this.setState({ curServiceIdx: _curServiceIdx + 1 });
                    } else {
                      const _priceCondition = Math.floor(Math.random() * 2);
                      this.setState({
                        priceCondition: _priceCondition,
                        serviceQuestions: false,
                        priceQuestions: true
                      });
                    }
                  } else if (this.state.priceQuestions) {
                    if (
                      this.state.priceCondition == 0 &&
                      (this.state.model1Price.trim().length == 0 ||
                        !this.isNumeric(this.state.model1Price))
                    ) {
                      Alert.alert(
                        "Error",
                        "Please enter a valid numeric value to continue."
                      );
                      return;
                    } else if (
                      this.state.priceCondition == 1 &&
                      (this.state.model2Price.trim().length == 0 ||
                        !this.isNumeric(this.state.model2Price))
                    ) {
                      Alert.alert(
                        "Error",
                        "Please enter a valid numeric value to continue."
                      );
                      return;
                    } else if (
                      this.state.priceCondition == 2 &&
                      (this.state.model1Price.trim().length == 0 ||
                        !this.isNumeric(this.state.model1Price) ||
                        this.state.model2Price.trim().length == 0 ||
                        !this.isNumeric(this.state.model2Price))
                    ) {
                      Alert.alert(
                        "Error",
                        "Please enter a valid numeric values to continue."
                      );
                      return;
                    }

                    this.saveResponse();
                  }
                }}
                title="Next"
                color="#20B2AA"
                accessibilityLabel="Save"
              />
            </TouchableHighlight>
          </View>
        )}
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
