import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';
import logger from '../controllers/logger';
const codeFileName='toolbar.js';
import {SURVEY_STATUS} from '../controllers/constants'
import commonStyles from './Style'

class ToolBar extends React.Component {

  state={minRemaining:21, secRemaining:14}

  interval = null;

  //var { navigate } = this.props.navigation;
  componentDidMount()
  {
    const _appStatus = appStatus.getStatus();
    const _lastNotificationTime = _appStatus.LastNotificationTime;
    const _curTime = new Date();

    const _secondsPassed = (_curTime.getTime() - _lastNotificationTime.getTime())/1000;
    const _secRemaining = _appStatus.PromptDuration * 60 - _secondsPassed;

    this.setState({minRemaining: Math.floor(_secRemaining/60), secRemaining: Math.floor(_secRemaining%60)})
    this.interval = setInterval(()=> this.updateTimeDisplay(), 1000)
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
        <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'stretch', margin:2}}>
            <View style={{flex:1, flexDirection:'column', justifyContent:'center',alignItems:'stretch', width:300}}>
                 <Text numberOfLines={1} style={{width:300,textAlign: "left", marginLeft:10,marginBottom:8, fontWeight: 'bold',fontSize: 20}}>
                    {this.props.title}
                 </Text>

                 {(appStatus.getStatus().SurveyStatus == SURVEY_STATUS.ONGOING) &&
                     <View style={{flex:1, flexDirection:'row', justifyContent:'center',alignItems:'center', marginBottom:5}}>
                         <AnimatedProgressWheel style={{marginLeft:2, backgroundColor:'blue'}}
                              progress={this.props.progress}
                              animateFromValue={0}
                              duration={2000}
                              color={'green'}
                              backgroundColor={'#ffd280'}
                              size={20}
                              width={5}
                          />
                         <Text style={{marginLeft:10, fontSize:17}}>{this.state.minRemaining>9?this.state.minRemaining:'0'+this.state.minRemaining}:{this.state.secRemaining>9?this.state.secRemaining:'0'+this.state.secRemaining}</Text>
                     </View>
                 }
            </View>

            <View style={{flex:1, flexDirection:'column', justifyContent:'center',alignItems:'flex-end', marginBottom:5}}>
                 <TouchableHighlight style={{height: 30, width:30,
                                             marginLeft:5, marginRight:10,marginTop:10
                                             }}
                     onPress={() => this.props.navigation.navigate('UserSettings')}>

                     <Image
                      style={{width: '100%',
                             height:25, resizeMode : 'contain' , marginBottom:10, marginTop:10}}
                      source={require('../res/settings-icon.png')}
                     />
                  </TouchableHighlight>
                  <Text style={{marginRight:10, color:'green', marginTop:5, marginBottom:5}}>${appStatus.getStatus().CompletedSurveys*0.2}</Text>
            </View>

        </View>
    );
  }


}

export default withNavigation(ToolBar);