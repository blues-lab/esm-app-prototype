import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';

const codeFileName='toolbar.js';
import commonStyles from './Style'

class ToolBar extends React.Component {

  state={minRemaining:21, secRemaining:14}

  interval = null;

  //var { navigate } = this.props.navigation;
  componentDidMount()
  {
    this.setState({minRemaining:1, secRemaining:12})
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
    _secRemaining = this.state.secRemaining-1;
    if(_secRemaining==0)
    {
        if(_minRemaining>0)
        {
            _minRemaining = _minRemaining-1;
            _secRemaining=59;
        }
        else
        {
            //end
        }
    }
    this.setState({secRemaining: _secRemaining, minRemaining: _minRemaining});
  }

  render() {

    return (
        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', margin:2}}>
            <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'center', width:70}}>
            <View style={{flex:1, flexDirection:'column', justifyContent:'center',alignItems:'flex-start', width:70}}>

                 <Text style={{marginLeft:10,marginBottom:8, fontWeight: 'bold',fontSize: 19}}>
                    {this.props.title}
                 </Text>
                 <View style={{flex:1, flexDirection:'row', justifyContent:'center',alignItems:'center', marginBottom:5, marginLeft:20}}>
                 <AnimatedProgressWheel style={{marginLeft:30, paddingLeft:30, backgroundColor:'blue'}}
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
            </View>
            </View>

<View style={{flex:1, flexDirection:'row', justifyContent:'flex-end',alignItems:'center', marginBottom:5}}>
            <View style={{flex:1, flexDirection:'column', justifyContent:'center',alignItems:'center'}}>
                <TouchableHighlight style={{height: 30, width:30,
                                            marginLeft:5, marginRight:1,marginTop:10
                                            }}
                    onPress={() => this.props.navigation.navigate('UserSettings')}>

                    <Image
                     style={{width: '100%',
                            height:25, resizeMode : 'contain' , marginBottom:10, marginTop:10}}
                     source={require('../res/settings-icon.png')}
                    />
                 </TouchableHighlight>
                 <Text style={{marginRight:0, color:'green', marginTop:5}}>$2.08</Text>
            </View>
            </View>
        </View>
    );
  }


}

export default withNavigation(ToolBar);