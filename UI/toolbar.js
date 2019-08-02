import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';
import logger from '../controllers/logger';
const codeFileName='toolbar.js';
import {SURVEY_STATUS} from '../controllers/constants'
import commonStyles from './Style';

import ProgressBarAnimated from 'react-native-progress-bar-animated';

import { ProgressBar, Colors } from 'react-native-paper';

class ToolBar extends React.Component {

  state={minRemaining:21, secRemaining:14}

  interval = null;

  componentDidMount()
  {
    logger.info(codeFileName, 'componentDidMount', 'getting appStatus');
    const _appStatus = appStatus.getStatus();

    if(_appStatus.SurveyStatus == SURVEY_STATUS.ONGOING)
    {
        logger.info(codeFileName, 'componentDidMount', 'Survey status is ONGOING so setting up toolbar to show remaining time.')
        const _firstNotificationTime = _appStatus.FirstNotificationTime;

        if(_firstNotificationTime==null)
        {
            logger.error(codeFileName, 'componentDidMount', 'Fatal error: _firstNotificationTime is null. Returning.');
            return;
        }

        const _curTime = new Date();

        logger.info(codeFileName, 'componentDidMount', 'curTime:'+_curTime+'. _firstNotificationTime:'+_firstNotificationTime);
        const _secondsPassed = (_curTime.getTime() - _firstNotificationTime.getTime())/1000;
        const _secRemaining = _appStatus.PromptDuration * 60 - _secondsPassed;

        logger.info(codeFileName, 'componentDidMount', '_secRemaining:'+_secRemaining);


        this.setState({minRemaining: Math.floor(_secRemaining/60), secRemaining: Math.floor(_secRemaining%60)})
        //this.setState({minRemaining: 4, secRemaining: 20})
        this.interval = setInterval(()=> this.updateTimeDisplay(), 1000)
    }
    else
    {
        logger.info(codeFileName, 'componentDidMount', 'No survey is ONGOING. Returning.');
        return;
    }
  }

  componentWillUnmount()
  {
    clearInterval(this.interval);
  }

  constructor(props)
  {
    super(props);
  }

  updateTimeDisplay()
  {
    _minRemaining= this.state.minRemaining;
    _secRemaining = Math.max(0, this.state.secRemaining-1);
    if(_secRemaining==0)
    {
        if(_minRemaining>0)
        {
            _minRemaining = _minRemaining-1;
            _secRemaining=59;
        }
        else
        {
            if(appStatus.getStatus().SurveyStatus == SURVEY_STATUS.ONGOING)
            {
                //ongoing survey expired, go back to home
                logger.info(codeFileName, "updateTimeDisplay", "Survey expired, going back to home screen.");
                appStatus.setSurveyStatus(SURVEY_STATUS.NOT_AVAILABLE);
                if(this.props.title!="Settings")
                {
                    this.props.navigation.navigate('Home');
                }
            }
        }
    }
    this.setState({secRemaining: _secRemaining, minRemaining: _minRemaining});
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


             { (false || appStatus.getStatus().SurveyStatus == SURVEY_STATUS.ONGOING) &&
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
                ${appStatus.getStatus().CompletedSurveys*0.2}
            </Text>
    </View>

    );
  }


}

export default withNavigation(ToolBar);