import React from "react";

import {
  Platform,
  Text,
  View,
  Button,
  BackHandler,
  TouchableHighlight,
  Alert
} from "react-native";
import { NavigationEvents } from "react-navigation";
import PropTypes from "prop-types";
import logger from "../controllers/logger";
import commonStyles from "./Style";
import ToolBar from "./toolbar";
import * as strings from "../controllers/strings";
import * as utilities from "../controllers/utilities";
import notificationController from "../controllers/notificationController";
import appStatus from "../controllers/appStatus";
import { SURVEY_STATUS } from "../controllers/constants";

const codeFileName = "alvaPrompt.js";

export default class AlvaPromptScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <ToolBar
          title={strings.PROMPT_SCREEN_TITLE}
          progress={navigation.state.params.surveyProgress}
        />
      ),
      headerLeft: (
        <TouchableHighlight style={{ margin: 1 }}>
          <Button title="<" onPress={navigation.getParam("backHandler")}>
            {" "}
          </Button>
        </TouchableHighlight>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = { conversationTopic: "" };
  }

  componentDidMount() {
    logger.info(codeFileName, "componentDidMount", "Mounting components.");

    const { navigation } = this.props;
    const _topic = navigation.getParam("conversationTopic", "");
    this.props.navigation.setParams({
      backHandler: this.onBackButtonPressAndroid.bind(this)
    });
    this.setState({ conversationTopic: _topic });
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.state.routeName === "AlvaPrompt") {
      logger.info(codeFileName, "onBackButtonPressAndroid", "Going back.");
      this.props.navigation.goBack(null);
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

  componentWillUnmount() {
    logger.info(codeFileName, "componentWillUnmount", "Unmounting components.");
  }

  async expireSurvey(_appStatus) {
    const funcName = "expireSurvey";
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    _appStatus.CurrentSurveyID = null;
    await appStatus.setAppStatus(_appStatus);

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
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <View style={commonStyles.questionStyle}>
            <Text
              style={[
                commonStyles.longtextStyle,
                { fontSize: 24, backgroundColor: "lavender" }
              ]}
            >
              {strings.IMAGINE_TEXT}
            </Text>
          </View>

          <View style={commonStyles.buttonViewStyle}>
            <TouchableHighlight style={commonStyles.buttonTouchHLStyle}>
              <Button
                title={strings.NEXT_BUTTON}
                color="#20B2AA"
                onPress={async () => {
                  const _appStatus = await appStatus.loadStatus();
                  if (await utilities.currentSurveyExpired(_appStatus)) {
                    await this.expireSurvey(_appStatus);
                  } else {
                    this.props.navigation.navigate("ServiceMenu", {
                      conversationTopic: this.state.conversationTopic,
                      surveyProgress: 30
                    });
                  }
                }}
              />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

AlvaPromptScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  }).isRequired
};
