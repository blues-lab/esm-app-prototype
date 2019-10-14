import React from "react";
import {
  Alert,
  BackHandler,
  Button,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import * as RNFS from "react-native-fs";
import Icon from "react-native-vector-icons/Fontisto";
import { ProgressDialog } from "react-native-simple-dialogs";
import appStatus from "../controllers/appStatus";
import { SELECTED_SERVICES_FILE } from "../controllers/constants";
import logger from "../controllers/logger";
import * as strings from "../controllers/strings";
import * as utilities from "../controllers/utilities";
import commonStyle from "./Style";

const codeFileName = "exitSurvey.js";

const usefulnessOptions = [
  "Not useful at all",
  "Slightly useful",
  "Moderately useful",
  "Useful",
  "Very useful"
];
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

export default class ExitSurveyScreen extends React.Component {
  static navigationOptions = () => {
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
    const _selectedServices = new Set([]);

    try {
      if (await RNFS.exists(SELECTED_SERVICES_FILE)) {
        logger.info(
          codeFileName,
          "loadSelectedServices",
          "Loading selected services."
        );
        const _fileContents = await RNFS.readFile(SELECTED_SERVICES_FILE);
        const _lines = _fileContents.split("\n");

        for (let i = 0; i < _lines.length; i++) {
          if (_lines[i].trim().length > 0) {
            try {
              const _js = JSON.parse(_lines[i]);

              for (let j = 0; j < _js.length; j++) {
                for (let s = 0; s < _js[j].services.length; s++) {
                  _selectedServices.add(_js[j].services[s]);
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
        await this.promisedSetState({
          selectedServices: Array.from(_selectedServices)
        });
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
      serviceQuestions: _selectedServices.size > 0,
      noServiceQuestions: _selectedServices.size === 0
    });
  }

  async componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Adding event handlers.");
    if (Platform.OS === "android") {
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
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      );
    }
  }

  async saveResponse() {
    logger.info(codeFileName, "saveResponse", "Saving exit survey response.");

    this.setState({ saveWaitVisible: true });

    const _appStatus = await appStatus.loadStatus();

    const _response = {
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
      const _saved = utilities.writeJSONFile(
        _response,
        RNFS.DocumentDirectoryPath + "/exit-survey-response.js",
        codeFileName,
        "saveResponse"
      );
    }

    logger.info(codeFileName, "saveResponse", "Updating app status.");

    const _newStatus = _appStatus;
    _newStatus.ExitSurveyDone = true;
    await appStatus.setAppStatus(_newStatus, codeFileName, "saveResponse");
    this.setState({ saveWaitVisible: false });
    Alert.alert(
      strings.EXIT_SURVEY_DONE_HEADER,
      strings.EXIT_SURVEY_DONE,
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

  handleNextButtonPress = async () => {
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
      if (this.state.usefulness === "") {
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

      this.setState(prevState => {
        const _serviceResponses = prevState.serviceResponses;
        _serviceResponses.push({ [_curService]: _response });
        return {
          serviceResponses: _serviceResponses,
          usefulness: ""
        };
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
      if (this.state.whyNoService.trim().length === 0) {
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
        this.state.priceCondition === 0 &&
        (this.state.model1Price.trim().length === 0 ||
          !utilities.isNumeric(this.state.model1Price))
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
      }
      if (
        this.state.priceCondition === 1 &&
        (this.state.model2Price.trim().length === 0 ||
          !utilities.isNumeric(this.state.model2Price))
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
      }
      if (
        this.state.priceCondition === 2 &&
        (this.state.model1Price.trim().length === 0 ||
          !utilities.isNumeric(this.state.model1Price) ||
          this.state.model2Price.trim().length === 0 ||
          !utilities.isNumeric(this.state.model2Price))
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

      logger.info(codeFileName, "saveResponse", "Saving exit survey response.");
      await this.saveResponse();
    }
  };

  renderListItemUsefulness = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "lavender" }}
        onPress={async () => {
          logger.info(
            codeFileName,
            "handleUsefulnessSelection",
            "Service:" +
              this.state.selectedServices[this.state.curServiceIdx] +
              ", usefulness:" +
              item
          );
          this.setState({ usefulness: item });
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
          {item === this.state.usefulness && (
            <Icon
              name="radio-btn-active"
              size={20}
              color="grey"
              style={{ margin: 5 }}
            />
          )}
          {item !== this.state.usefulness && (
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
    if (model === 2) {
      return (
        <View>
          <Text style={{ fontSize: 20 }}> {strings.BOTH_MODEL_INTRO_TEXT}</Text>
          <Text style={{ fontSize: 20 }}>
            To provide them, in
            <Text style={{ fontWeight: "bold" }}> Model 1</Text>, audio
            recordings are:{" "}
          </Text>
          <View style={commonStyle.listContainerStyle}>
            <FlatList
              data={strings.MODEL1_FEATURES}
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
              data={strings.MODEL2_FEATURES}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      );
    }
    let modelFeatures = strings.MODEL1_FEATURES;
    if (model === 1) {
      modelFeatures = strings.MODEL2_FEATURES;
    }
    return (
      <View>
        <Text style={{ fontSize: 20 }}> {strings.SINGLE_MODEL_INTRO_TEXT}</Text>
        <View style={commonStyle.listContainerStyle}>
          <FlatList
            data={modelFeatures}
            renderItem={this.renderListItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ backgroundColor: "lavender" }}>
        {this.state.serviceQuestions && (
          <View style={styles.verticalViewStyle}>
            <Text style={[commonStyle.questionStyle]}>
              {strings.SERVICE_USEFULNESS(
                this.state.selectedServices[this.state.curServiceIdx]
                  .trim()
                  .toLowerCase()
              )}
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
              {strings.EXPLAIN_WHY_NO_SERVICES}
            </Text>
            <TextInput
              multiline
              numOfLines={5}
              style={commonStyle.inputStyle}
              onChangeText={text => this.setState({ whyNoService: text })}
              value={this.state.whyNoService}
            />
          </View>
        )}

        {this.state.priceQuestions && this.state.priceCondition === 0 && (
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

        {this.state.priceQuestions && this.state.priceCondition === 1 && (
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

        {this.state.priceQuestions && this.state.priceCondition === 2 && (
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
              onPress={async () => {
                await this.handleNextButtonPress();
              }}
              title="Next"
              color="#20B2AA"
              accessibilityLabel="Save"
            />
          </TouchableHighlight>
        </View>
        <ProgressDialog
          visible={this.state.saveWaitVisible}
          title={strings.SAVING_HEADER}
          message={strings.SAVING_WAIT}
        />
      </ScrollView>
    );
  }
}
