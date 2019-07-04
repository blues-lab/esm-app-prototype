import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';
//import SelectMultiple from 'react-native-select-multiple';
import NumericInput from 'react-native-numeric-input';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


const fruits = ['Apples', 'Oranges', 'Pears']
// --- OR ---
// const fruits = [
//   { label: 'Apples', value: 'appls' },
//   { label: 'Oranges', value: 'orngs' },
//   { label: 'Pears', value: 'pears' }
// ]


export default class ContextualQuestionScreen extends React.Component {

  state={ value:0, numOfPeople:0, relations: [], ages:[], locations:[] }




  constructor(props) 
  {
    super(props);
  }

  numOfPeopleSelectionChanged = (value) => {
     //this.setState({numOfPeople: value});
    //Alert.alert("hi  :"+this.state.numOfPeople+","+value);
    //this.setState({numOfPeople: value});
    }


   relationSelectionsChange = (selectedOptions) => {
      // selectedFruits is array of { label, value }
      //this.setState({ relations:[], ages:[], numOfPeople:0 })

      //Alert.alert('selected: '+selectedOptions[0].value);
    }


  componentDidMount()
  {
    const { navigation } = this.props;

  }



  render() {
    return (
    <View>
    <ScrollView>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginRight:10,
          marginLeft:10,
          backgroundColor:'lightcyan',
          }}>

            <Text style={styles.questionStyle}>
                How many other people (excluding you) were talking?
            </Text>

            <NumericInput
               value={this.state.value}
               onChange={value => this.setState({value})}
               onLimitReached={(isMax,msg) => console.log(isMax,msg)}
               totalWidth={260}
               totalHeight={50}
               iconSize={25}
               step={1}
               valueType='integer'
               rounded
               textColor='#B0228C'
               iconStyle={{ color: 'white' }}
               rightButtonBackgroundColor='#66c1e5'
               leftButtonBackgroundColor='#92d3ed'
            />
            

      </View>

      <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight:10,
                    marginLeft:10,
                    backgroundColor:'lightcyan',
                    }}>
          <TouchableHighlight style ={{
                                height: 40,
                                width:160,
                                borderRadius:10,
                                marginLeft:5,
                                marginRight:5,
                                marginTop:10,
                                marginBottom:10
                              }}>
            <Button
              onPress={() => Alert.alert("value:"+this.state.value)}
              title="Save"
              color="#20B2AA"
              accessibilityLabel="Save"
            />
          </TouchableHighlight>
      </View>

      </ScrollView>


</View>

    );
  }
}

const styles = StyleSheet.create({
  questionStyle: {
    color: 'black',
    fontFamily:'Times New Roman',
    //fontWeight: 'bold',
    fontSize: 18,
    borderColor: 'black',
    paddingRight:20,
    paddingLeft:20,
    paddingTop:10,
    paddingBottom:10,
    marginTop:5,
    backgroundColor:'#a7f1e9',
  },
 radioFrameStyle: {
    //justifyContent: 'center',
    //flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 15,
    paddingLeft:30,
    paddingRight:40,
  },

  inputStyle:{
    height: 100,
    width: 300,
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    paddingRight:20,
    paddingLeft:20,
    paddingTop:10,
    paddingBottom:10,
    marginTop:5,
  }
});