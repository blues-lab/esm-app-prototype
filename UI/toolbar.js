import React from "react";
import {
  Text,
  View,
  TouchableHighlight,
  BackHandler,
  Alert
} from "react-native";

import PropTypes from "prop-types";
import { NavigationEvents, withNavigation } from "react-navigation";
import Icon from "react-native-vector-icons/Feather";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import appStatus from "../controllers/appStatus";
import { SURVEY_STATUS, PROMPT_DURATION } from "../controllers/constants";
import notificationController from "../controllers/notificationController";
import logger from "../controllers/logger";
import { SURVEY_EXPIRED, SURVEY_EXPIRED_HEADER } from "../controllers/strings";
import * as utilities from "../controllers/utilities";

const codeFileName = "toolbar.js";

class ToolBar extends React.Component {
  interval = null;

  promisedSetState = newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  async expireSurvey(_appStatus) {
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    _appStatus.CurrentSurveyID = null;
    await appStatus.setAppStatus(_appStatus);

    await this.promisedSetState({
      surveyStatus: SURVEY_STATUS.NOT_AVAILABLE
    });

    Alert.alert(
      SURVEY_EXPIRED_HEADER,
      SURVEY_EXPIRED,
      [
        {
          text: "OK",
          onPress: async () => {
            await logger.info(
              codeFileName,
              "updateTimeDisplay",
              "Page:" + this.props.title + ". Survey expired, exiting app."
            );
            notificationController.cancelNotifications();
            this.props.navigation.navigate("Home");
          }
        }
      ],
      { cancelable: false }
    );
  }

  async initToolbar() {
    const _appStatus = await appStatus.loadStatus();

    if (this._isMounted) {
      await this.promisedSetState({
        surveyStatus: _appStatus.SurveyStatus,
        completedSurveys: _appStatus.CompletedSurveys,
        exitSurveyDone: Number(_appStatus.ExitSurveyDone)
      });
    }

    await logger.info(
      codeFileName,
      "initToolbar",
      "Page:" +
        this.props.title +
        ". Route name: " +
        this.props.navigation.state.routeName +
        ". Progress:" +
        this.props.progress +
        ". Survey status:" +
        _appStatus.SurveyStatus +
        ". Current appStatus:" +
        JSON.stringify(_appStatus)
    );

    if (
      _appStatus.SurveyStatus !== SURVEY_STATUS.ONGOING &&
      this.props.navigation.state.routeName !== "Home"
    ) {
      logger.warn(
        codeFileName,
        "initToolbar",
        "Should not be in this page unless survey is ongoing. Expiring any previous survey."
      );
      await this.expireSurvey(_appStatus);
    } else if (_appStatus.SurveyStatus === SURVEY_STATUS.ONGOING) {
      await logger.info(
        codeFileName,
        "initToolbar",
        "Page:" +
          this.props.title +
          ". Survey status is ONGOING in appStatus, checking if survey is expired."
      );
      if (await utilities.currentSurveyExpired(_appStatus)) {
        await this.expireSurvey(_appStatus);
        return;
      }

      const _firstNotificationTime = _appStatus.FirstNotificationTime;

      if (_firstNotificationTime === null) {
        await logger.error(
          codeFileName,
          "initToolbar",
          "Page:" +
            this.props.title +
            ". Fatal error: _firstNotificationTime is null. Returning."
        );
        return;
      }

      const _curTime = new Date();

      await logger.info(
        codeFileName,
        "initToolbar",
        "Page:" +
          this.props.title +
          ", curTime:" +
          _curTime +
          ", _firstNotificationTime:" +
          _firstNotificationTime
      );
      const _secondsPassed =
        (_curTime.getTime() - _firstNotificationTime.getTime()) / 1000;
      const _secRemaining = PROMPT_DURATION * 60 - _secondsPassed;

      this.setState({
        minRemaining: Math.floor(_secRemaining / 60),
        secRemaining: Math.floor(_secRemaining % 60)
      });

      if (this.interval == null) {
        await logger.info(
          codeFileName,
          "initToolbar",
          "Page:" +
            this.props.title +
            ". Starting timer to update remaining time."
        );
        this.interval = setInterval(() => this.updateTimeDisplay(), 1000);
      } else {
        await logger.info(
          codeFileName,
          "initToolbar",
          "Page:" +
            this.props.title +
            ". Timer to update remaining time is already running."
        );
      }
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    await logger.info(
      codeFileName,
      "componentDidMount",
      "Mounting components. Page: " + this.props.navigation.state.routeName
    );
    await this.initToolbar();
  }

  componentWillUnmount() {
    this._isMounted = false;
    logger.info(
      codeFileName,
      "componentWillUnmount",
      "Unmounting components. Page:" + this.props.navigation.state.routeName
    );
  }

  constructor(props) {
    super(props);
    this._isMounted = false;

    this.state = {
      minRemaining: null,
      secRemaining: null,
      surveyStatus: null,
      completedSurveys: 0,
      exitSurveyDone: 0
    };
  }

  async updateTimeDisplay() {
    if (this._isMounted) {
      const _appStatus = await appStatus.loadStatus();
      // update self survey state
      if (this._isMounted) {
        await this.promisedSetState({ surveyStatus: _appStatus.SurveyStatus });
      }

      if (await utilities.currentSurveyExpired(_appStatus)) {
        //if no survey is ongoing, no point in updating time.
        logger.info(
          codeFileName,
          "updateTimeDisplay",
          "Current page:" +
            this.props.navigation.state.routeName +
            ". Expiring survey."
        );
        await this.expireSurvey();
        return;
      }

      const _firstNotificationTime = _appStatus.FirstNotificationTime;
      if (_firstNotificationTime === null) {
        await logger.error(
          codeFileName,
          "updateTimeDisplay",
          "Page:" +
            this.props.title +
            ". Fatal error: _firstNotificationTime is null. Returning."
        );
        return;
      }
      const _curTime = new Date();
      const _secondsPassed =
        (_curTime.getTime() - _firstNotificationTime.getTime()) / 1000;
      let _secRemaining = PROMPT_DURATION * 60 - _secondsPassed;

      let _minRemaining = Math.floor(_secRemaining / 60);
      _secRemaining = Math.floor(_secRemaining % 60);

      if (this._isMounted) {
        await this.promisedSetState({
          secRemaining: _secRemaining,
          surveyStatus: _appStatus.SurveyStatus
        });
      }

      if (_secRemaining <= 0) {
        if (_minRemaining > 0) {
          _minRemaining -= 1;
          _secRemaining = 59;

          if (this._isMounted) {
            await this.promisedSetState({
              secRemaining: _secRemaining,
              minRemaining: _minRemaining
            });
          }
        } else {
          //ongoing survey expired, go back to home
          if (this.interval != null) {
            clearInterval(this.interval);
          }
          logger.log(
            codeFileName,
            "updateTimeDisplay",
            "Current page:" +
              this.props.navigation.state.routeName +
              ". Expiring survey."
          );
          await this.expireSurvey();
        }
      }
    } else {
      logger.warn(
        codeFileName,
        "updateTimeDisplay",
        "Component not mounted! Should not come to this point."
      );
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          margin: 5
        }}
      >
        <NavigationEvents
          onDidFocus={async payload => {
            logger.info(
              codeFileName,
              "onDidFocus",
              "Current page:" +
                this.props.navigation.state.routeName +
                ". Initializing toolbar. Payload:" +
                JSON.stringify(payload)
            );
            await this.initToolbar();
          }}
          onWillBlur={payload => {
            logger.info(
              codeFileName,
              "onWillBlur",
              "Current page:" +
                this.props.navigation.state.routeName +
                ". Removing timer. Payload: " +
                JSON.stringify(payload)
            );

            if (this.interval !== null) {
              clearInterval(this.interval);
            }
          }}
        />

        <TouchableHighlight
          style={{ height: 30 }}
          onPress={() => {
            const _backCallBack = this.props.navigation.getParam(
              "backCallBack",
              null
            ); //back button callback sent from Home
            this.props.navigation.navigate("UserSettings", {
              firstLaunch: false,
              backCallBack: _backCallBack
            });
          }}
        >
          <Icon name="settings" size={30} color="black" style={{ margin: 5 }} />
        </TouchableHighlight>

        {this.state.surveyStatus === SURVEY_STATUS.ONGOING && (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {this.state.minRemaining <= 15 && this.state.minRemaining >= 0 && (
              <Text style={{ fontSize: 20 }}>
                {this.state.minRemaining > 9
                  ? this.state.minRemaining
                  : "0" + this.state.minRemaining}
                :
                {this.state.secRemaining > 9
                  ? this.state.secRemaining
                  : "0" + this.state.secRemaining}
              </Text>
            )}

            <ProgressBarAnimated
              width={120}
              value={this.props.progress}
              height={10}
              maxValue={100}
              borderColor="grey"
              backgroundColorOnComplete="green"
              backgroundColor="green"
            />
          </View>
        )}

        <Text style={{ color: "green", fontSize: 20, marginRight: 10 }}>
          ${this.state.completedSurveys * 1 + this.state.exitSurveyDone}
        </Text>
      </View>
    );
  }
}

ToolBar.propTypes = {
  title: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired
  }).isRequired
};

export default withNavigation(ToolBar);
