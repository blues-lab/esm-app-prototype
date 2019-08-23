import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight, BackHandler, AppState} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';
import logger from '../controllers/logger';
const codeFileName='toolbar.js';
import {SURVEY_STATUS, PROMPT_DURATION} from '../controllers/constants'
import notificationController from '../controllers/notificationController';
import commonStyles from './Style';
import Icon from 'react-native-vector-icons/Feather';
import ProgressBarAnimated from 'react-native-progress-bar-animated';

import { ProgressBar, Colors } from 'react-native-paper';

class ToolBar extends React.Component {

  state={minRemaining:null, secRemaining:null, surveyStatus:null, completedSurveys:0, appState: AppState.currentState}

  interval = null;


  promisedSetState = (newState) =>
  {
        return new Promise((resolve) =>
        {
            this.setState(newState, () => {
                resolve()
            });
        });
  }

  async initToolbar()
  {
      const _appStatus  = await appStatus.loadStatus();

      if(this._isMounted)
      {
        await this.promisedSetState({surveyStatus: _appStatus.SurveyStatus,
                       completedSurveys: _appStatus.CompletedSurveys});
      }

        await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Progress:'+this.props.progress+'. Current appStatus:'+JSON.stringify(_appStatus));

        if(_appStatus.SurveyStatus == SURVEY_STATUS.ONGOING)
        {
            await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Survey status is ONGOING, setting up toolbar to show remaining time.')
            const _firstNotificationTime = _appStatus.FirstNotificationTime;

            if(_firstNotificationTime==null)
            {
                await logger.error(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Fatal error: _firstNotificationTime is null. Returning.');
                return;
            }

            const _curTime = new Date();

            await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+', curTime:'+_curTime+', _firstNotificationTime:'+_firstNotificationTime);
            const _secondsPassed = (_curTime.getTime() - _firstNotificationTime.getTime())/1000;
            const _secRemaining = PROMPT_DURATION * 60 - _secondsPassed;

            this.setState({minRemaining: Math.floor(_secRemaining/60), secRemaining: Math.floor(_secRemaining%60)});

            if(this.interval==null)
            {
                await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Starting timer to update remaining time.');
                this.interval = setInterval(()=> this.updateTimeDisplay(), 1000)
            }
            else
            {
                await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Timer to update remaining time is already running.');
            }
        }
        else
        {
            await logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. No survey is ONGOING. Returning.');
            return;
        }

  }

  async componentDidMount()
  {
     this._isMounted = true;
     await logger.info(codeFileName, 'componentDidMount', 'Page:'+this.props.title+'. Initializing toolbar.');
     await this.initToolbar();
  }

  componentWillUnmount()
  {
    this._isMounted = false;
    logger.info(codeFileName, 'componentWillUnmount', 'Page:'+this.props.title+'. Removing event listeners.');
    if(this.interval!=null)
    {
        clearInterval(this.interval);
    }
  }

  constructor(props)
  {
    super(props);
    this._isMounted = false;
  }

  async updateTimeDisplay()
  {
    if(this._isMounted)
    {

    _appStatus  = await appStatus.loadStatus();
    // update self survey state
    if(this._isMounted)
    {
        await this.promisedSetState({surveyStatus: _appStatus.SurveyStatus});
    }

    if(_appStatus.SurveyStatus != SURVEY_STATUS.ONGOING)
    {//if no survey is ongoing, no point in updating time.
        return;
    }

    const _firstNotificationTime = _appStatus.FirstNotificationTime;
    if(_firstNotificationTime==null)
    {
        await logger.error(codeFileName, 'updateTimeDisplay', 'Page:'+this.props.title+'. Fatal error: _firstNotificationTime is null. Returning.');
        return;
    }
    const _curTime = new Date();
    const _secondsPassed = (_curTime.getTime() - _firstNotificationTime.getTime())/1000;
    _secRemaining = PROMPT_DURATION * 60 - _secondsPassed;


    _minRemaining= Math.floor(_secRemaining/60);
    _secRemaining = Math.floor(_secRemaining%60);

    if(this._isMounted)
    {
        await this.promisedSetState({secRemaining: _secRemaining, surveyStatus: _appStatus.SurveyStatus});
    }

    if(_secRemaining<=0)
    {
        if(_minRemaining>0)
        {
            _minRemaining = _minRemaining-1;
            _secRemaining=59;

            if(this._isMounted)
            {
                await this.promisedSetState({secRemaining: _secRemaining, minRemaining: _minRemaining});
            }
        }
        else
        {
            //ongoing survey expired, go back to home
            if(this.interval!=null)
            {
                clearInterval(this.interval);
            }
            if(this._isMounted)
            {
                await this.promisedSetState({surveyStatus:SURVEY_STATUS.NOT_AVAILABLE});
            }

            _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
            _appStatus.CurrentSurveyID = null;
            await appStatus.setAppStatus(_appStatus);

            if(this.props.title!="Settings")
            {
                Alert.alert(
                        'Survey expired!',
                        'Sorry, the current survey is expired. We will notify you once new surveys become available.',
                        [
                          {text: 'OK', onPress: async () =>
                            {
                              await logger.info(codeFileName, "updateTimeDisplay", 'Page:'+this.props.title+". Survey expired, exiting app.");
                              notificationController.cancelNotifications();
                              BackHandler.exitApp();
                            }
                          }
                        ],
                        {cancelable: false},
                      );
            }
        }
    }
    }

  }

  render() {

    return (
    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'stretch', margin:5}}>

             <TouchableHighlight style={{height: 30}}
                 onPress={() => {
                        _backCallBack = this.props.navigation.getParam('backCallBack', null);//back button callback sent from Home
                        this.props.navigation.navigate('UserSettings',{firstLaunch:false, backCallBack:_backCallBack})
                      }}>

                 <Icon name="settings" size={30} color="black" style ={{margin:5}}/>
             </TouchableHighlight>


             {   (this.state.surveyStatus == SURVEY_STATUS.ONGOING) &&
                 <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                     <Text style={{fontSize:20}}>
                         {this.state.minRemaining>9?this.state.minRemaining:'0'+this.state.minRemaining}:{this.state.secRemaining>9?this.state.secRemaining:'0'+this.state.secRemaining}
                     </Text>
                     
                     <ProgressBarAnimated
                                 width={120}
                                 value={this.props.progress}
                                 height={10}
                                 maxValue={100}
                                 borderColor='grey'
                                 backgroundColorOnComplete="green"
                                 backgroundColor = 'green'
                     />
                 </View>
            }

            <Text style={{color:'green',fontSize:20, marginRight:10}}>
                ${(this.state.completedSurveys * 1).toFixed(1)}
            </Text>
    </View>

    );
  }


}

export default withNavigation(ToolBar);