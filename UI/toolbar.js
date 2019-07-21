import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
Image, TouchableHighlight} from 'react-native';

import AnimatedProgressWheel from 'react-native-progress-wheel';
import { withNavigation } from 'react-navigation';
import appStatus from '../controllers/appStatus';

const codeFileName='toolbar.js';
import commonStyles from './Style'

class ToolBar extends React.Component {

  //var { navigate } = this.props.navigation;
  componentDidMount()
  {
  }

  render() {

    return (
        <View style={commonStyles.pageHeaderStyle}>
             <View style={{flex:1, flexDirection:'row', justifyContent: 'flex-start'}}>
                 <Text style={{marginLeft:15, marginRight:10, fontWeight: 'bold',fontSize: 20}}>
                    Home
                 </Text>
                 <AnimatedProgressWheel
                     progress={20}
                     animateFromValue={0}
                     duration={2000}
                     color={'green'}
                     backgroundColor={'#ffd280'}
                     size={30}
                     width={5}
                 />
            </View>

            <TouchableHighlight style={{flex:1, flexDirection:'column',
                                        justifyContent:'center',
                                        height: 40, width:160,
                                        marginLeft:5, marginRight:1,
                                        }}
                onPress={() => this.props.navigation.navigate('UserSettings')}>
            <View>

                <Image
                                     style={{width: '100%',
                                            height:20, resizeMode : 'contain' , margin:1}}
                                     source={require('../res/settings-icon.png')}
                                 />
                                 </View>
             </TouchableHighlight>
        </View>
    );
  }


}

export default withNavigation(ToolBar);