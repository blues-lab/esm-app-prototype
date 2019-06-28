/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';
//import * as RNFS from 'react-native-fs';
import { createStackNavigator, createAppContainer } from 'react-navigation';


//Import UI files
import SurveyStartScreen from './UI/startsurvey'
import HomeScreen from './UI/home'


//The main navigation controller
const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    StartSurvey: SurveyStartScreen
  },
  {
    initialRouteName: "Home"
  }
);


const AppContainer = createAppContainer(AppNavigator);


export default class App extends Component<Props> 
{



  componentDidMount()
  {
    
  }

  render() {

    return <AppContainer />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
