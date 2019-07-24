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

  constructor(props)
  {
    super(props);


  }

  render() {

    return (
        <View style={commonStyles.pageHeaderStyle}>

                 <Text style={{margin:10, fontWeight: 'bold',fontSize: 20}}>
                    {this.props.title}
                 </Text>
                 <AnimatedProgressWheel
                     progress={this.props.progress}
                     animateFromValue={0}
                     duration={2000}
                     color={'green'}
                     backgroundColor={'#ffd280'}
                     size={25}
                     width={5}
                 />


            <TouchableHighlight style={{flex:1, flexDirection:'row',
                                        justifyContent:'flex-end',
                                        height: 20, width:20,
                                        marginLeft:5, marginRight:1,
                                        }}
                onPress={() => this.props.navigation.navigate('UserSettings')}>

                <Image
                 style={{width: '100%',
                        height:20, resizeMode : 'contain' , margin:1}}
                 source={require('../res/settings-icon.png')}
                />
             </TouchableHighlight>
             <Text style={{marginRight:5}}>2.00$</Text>

        </View>
    );
  }


}

export default withNavigation(ToolBar);