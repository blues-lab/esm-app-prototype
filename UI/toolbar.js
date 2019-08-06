import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight, BackHandler, AppState} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';
import logger from '../controllers/logger';
const codeFileName='toolbar.js';
import {SURVEY_STATUS} from '../controllers/constants'
import notificationController from '../controllers/notificationController';
import commonStyles from './Style';

import ProgressBarAnimated from 'react-native-progress-bar-animated';

import { ProgressBar, Colors } from 'react-native-paper';

class ToolBar extends React.Component {

  state={minRemaining:null, secRemaining:null, surveyStatus:null, completedSurveys:0, appState: AppState.currentState}

  interval = null;


  async initToolbar()
  {
      const _appStatus  = await appStatus.loadStatus();

      this.setState({surveyStatus: _appStatus.SurveyStatus,
                       completedSurveys: _appStatus.CompletedSurveys}, ()=>
        {
            logger.info(codeFileName, 'initToolbar', 'Page:'+this.props.title+'. Progress:'+this.props.progress+'. Current appStatus:'+JSON.stringify(_appStatus));
            if(_appStatus.SurveyStatus == SURVEY_STATUS.ONGOING)
            {
                logger.info(codeFileName, 'initToolbar', 'Survey status is ONGOING so setting up toolbar to show remaining time.')
                const _firstNotificationTime = _appStatus.FirstNotificationTime;

                if(_firstNotificationTime==null)
                {
                    logger.error(codeFileName, 'initToolbar', 'Fatal error: _firstNotificationTime is null. Returning.');
                    return;
                }

                const _curTime = new Date();

                logger.info(codeFileName, 'initToolbar', 'curTime:'+_curTime+'. _firstNotificationTime:'+_firstNotificationTime);
                const _secondsPassed = (_curTime.getTime() - _firstNotificationTime.getTime())/1000;
                const _secRemaining = _appStatus.PromptDuration * 60 - _secondsPassed;

                this.setState({minRemaining: Math.floor(_secRemaining/60), secRemaining: Math.floor(_secRemaining%60)});

                if(this.interval==null)
                {
                    this.interval = setInterval(()=> this.updateTimeDisplay(), 1000)
                }
            }
            else
            {
                logger.info(codeFileName, 'initToolbar', 'No survey is ONGOING. Returning.');
                return;
            }
        })
  }

  async componentDidMount()
  {
     logger.info(codeFileName, 'componentDidMount', 'Initializing toolbar.');
     await this.initToolbar();
  }

  componentWillUnmount()
  {
    if(this.interval!=null)
    {
        clearInterval(this.interval);
    }
  }

  constructor(props)
  {
    super(props);
  }

  async updateTimeDisplay()
  {
    const _appStatus  = await appStatus.loadStatus();
    const _firstNotificationTime = _appStatus.FirstNotificationTime;
    if(_firstNotificationTime==null)
    {
        logger.error(codeFileName, 'initToolbar', 'Fatal error: _firstNotificationTime is null. Returning.');
        return;
    }
    const _curTime = new Date();
    const _secondsPassed = (_curTime.getTime() - _firstNotificationTime.getTime())/1000;
    _secRemaining = _appStatus.PromptDuration * 60 - _secondsPassed;


    _minRemaining= Math.floor(_secRemaining/60);
    _secRemaining = Math.floor(_secRemaining%60);

    this.setState({secRemaining: _secRemaining});
    if(_secRemaining<=0)
    {
        if(_minRemaining>0)
        {
            _minRemaining = _minRemaining-1;
            _secRemaining=59;

            this.setState({secRemaining: _secRemaining, minRemaining: _minRemaining});
        }
        else
        {
            if(this.state.surveyStatus == SURVEY_STATUS.ONGOING)
            {
                //ongoing survey expired, go back to home

                if(this.interval!=null)
                {
                    clearInterval(this.interval);
                }
                this.setState({surveyStatus:SURVEY_STATUS.NOT_AVAILABLE}, ()=>
                {
                    appStatus.setSurveyStatus(SURVEY_STATUS.NOT_AVAILABLE)
                             .then(()=>
                             {
                                    if(this.props.title!="Settings")
                                    {
                                        Alert.alert(
                                                'Survey expired!',
                                                'Sorry, the current survey is expired. We will notify you once new surveys become available.',
                                                [
                                                  {text: 'OK', onPress: () =>
                                                    {
                                                      logger.info(codeFileName, "updateTimeDisplay", "Survey expired, exiting app.");
                                                      notificationController.cancelNotifications();
                                                      BackHandler.exitApp();
                                                    }
                                                  }
                                                ],
                                                {cancelable: false},
                                              );
                                    }
                             })
                })
            }
        }
    }
  }

  render() {

    return (
    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'stretch', margin:5}}>

             <TouchableHighlight style={{height: 30, width:30
                                         }}
                 onPress={() => this.props.navigation.navigate('UserSettings',{firstLaunch:false})}>

                 <Image
                  style={{width: '100%',
                         height:25, resizeMode : 'contain'}}
                  source={require('../res/settings-icon.png')}
                 />
             </TouchableHighlight>


             { (false || this.state.surveyStatus == SURVEY_STATUS.ONGOING) &&
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
                ${(this.state.completedSurveys * 0.2).toFixed(2)}
            </Text>
    </View>

    );
  }


}

export default withNavigation(ToolBar);