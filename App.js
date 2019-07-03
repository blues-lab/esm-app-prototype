/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import { createStackNavigator, createAppContainer } from 'react-navigation';


//Import UI files
import HomeScreen from './UI/home'
import SurveyStartScreen from './UI/startsurvey'
import ServiceMenuScreen from './UI/servicemenu'
import ServiceDetailsScreen from './UI/servicedetails'



//The main navigation controller
const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    StartSurvey: SurveyStartScreen,
    ServiceMenu: ServiceMenuScreen,
    ServiceDetails: ServiceDetailsScreen
  },
  {
    initialRouteName: "Home"
  }
);


const AppContainer = createAppContainer(AppNavigator);

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


export default class App extends Component<Props> 
{

  state = {services: "No services found", newService: null};


  generateInitialFiles()
  {
    RNFS.readFileAssets(serviceFileAsset)
        .then((res) => {
              xx=JSON.parse(res);
              RNFS.writeFile(serviceFileLocal,JSON.stringify(xx))
              .then((success) => 
              {
               //Alert.alert('surccess writing ', JSON.stringify(xx));
              })
              .catch((err) => 
              {
                Alert.alert
                (
                  'Error',
                  err.message+', '+err.code
                );
              })
        })  
        .catch((err) => {
          //Alert.alert("Error: "+err.code,err.message);
          this.setState({services: err.message+', '+err.code});
        })
  }


  componentDidMount()
  {

    this.generateInitialFiles();

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
