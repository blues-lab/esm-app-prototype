import React from "react";

import {
  Platform,
  Text,
  View,
  Button,
  BackHandler,
  TouchableHighlight
} from "react-native";
import PropTypes from "prop-types";
import logger from "../controllers/logger";
import commonStyles from "./Style";
import ToolBar from "./toolbar";

const codeFileName = "startsurvey.js";

export default class AlvaPromptScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <ToolBar
          title="MIMI"
          progress={navigation.state.params.surveyProgress}
        />
      ),
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
    this.state = { conversationTopic: "" };
  }

  startNewSurvey = () =>
    //Will be called if participants indicate recent conversation
    {
      //this.props.navigation.navigate('StartSurvey');
    };

  componentDidMount() {
    const { navigation } = this.props;
    const _topic = navigation.getParam("conversationTopic", "");
    this.props.navigation.setParams({
      backHandler: this.onBackButtonPress.bind(this)
    });
    this.setState({ conversationTopic: _topic });
    if (Platform.OS === "android") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPress.bind(this)
      );
    }
  }

  onBackButtonPress = () => {
    this.props.navigation.goBack(null);
    return true;
  };

  componentWillUnmount() {
    logger.info(
      codeFileName,
      "componentWillUnmount",
      "Removing event listeners."
    );
    if (Platform.OS === "android") {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackButtonPress
      );
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
              <Text>Imagine an </Text>
              <Text style={{ fontWeight: "bold" }}>
                always-listening voice assistant
              </Text>
              <Text>, MiMi, was able to offer you services that were </Text>
              <Text style={{ fontWeight: "bold" }}>relevant </Text>
              <Text>to your conversation.</Text>
            </Text>
          </View>

          <View style={commonStyles.buttonViewStyle}>
            <TouchableHighlight style={commonStyles.buttonTouchHLStyle}>
              <Button
                title="Next"
                color="#20B2AA"
                onPress={() => {
                  this.props.navigation.navigate("ServiceMenu", {
                    conversationTopic: this.state.conversationTopic,
                    surveyProgress: 30
                  });
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
