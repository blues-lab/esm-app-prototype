import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';
//import SelectMultiple from 'react-native-select-multiple';
import NumericInput from 'react-native-numeric-input';

import { CheckBox } from 'react-native-elements'

//import CheckBoxes from 'react-native-group-checkbox'

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

import logger from '../controllers/logger';
const codeFileName = "relations.js"

export default class Relations extends React.Component {

  state={familySelected:false, friendSelected:false, acquaintanceSelected:false, colleaguesSelected:false,
         roommatesSelected:false, workerSelected:false, unknownSelected:false, selectedRelations:[],
         otherDialogVisible: false,
         relationNames : [
                 {name: "Family members", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Friends", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Acquaintance", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Colleagues", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Roommates/other tenants", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Domestic worker/nanny", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Unknown", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Other", renderStyle: styles.unselectedStyle, selected: false},
             ]
        }

  constructor(props) 
  {
    super(props);
  }


  componentDidMount()
  {
    this.setState({familySelected:false, friendSelected:false, selectedRelations:[]});
  }

  handleSelectionChange(index)
  {
    _relationNames = this.state.relationNames;
    _relationNames[index].selected = !_relationNames[index].selected
    if(_relationNames[index].selected)
    {
        _relationNames[index].renderStyle = styles.selectedStyle;
        //check if 'other' was selected
        if(_relationNames[index].name=='Other')
        {
            this.setState({otherDialogVisible: true});
        }
    }
    else
    {
        _relationNames[index].renderStyle = styles.unselectedStyle;
    }

    logger.info(`${codeFileName}`,'handleSelectionChange',
        `relation: ${_relationNames[index].name}, selected: ${_relationNames[index].selected}`)
    this.setState({relationNames: _relationNames});
  }



  render() {
    return (

       <View  style={{
                 flex: 1,
                 flexDirection: 'column',
                 justifyContent: 'space-around',
                 alignItems: 'stretch',
                 margin:10,
                 backgroundColor:'lightcyan',
                 }}>

            <View style={styles.rowView}>

                <TouchableHighlight style={this.state.relationNames[0].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 0)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.relationNames[0].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[1].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 1)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.relationNames[1].name}</Text>
                </TouchableHighlight>

            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[2].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 2)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.relationNames[2].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[3].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 3)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.relationNames[3].name}</Text>
                </TouchableHighlight>
            </View>


            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[4].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 4)
                        }>
                      <Text style={styles.itemTextStyle}>{this.state.relationNames[4].name}</Text>
                </TouchableHighlight>

            </View>
            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[5].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 5)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.relationNames[5].name}</Text>
                </TouchableHighlight>
            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[6].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this,6)
                        }>
                <Text style={styles.itemTextStyle}>{this.state.relationNames[6].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[7].renderStyle}
                            onPress={
                                  this.handleSelectionChange.bind(this, 7)
                            }>
                <Text style={styles.itemTextStyle}>{this.state.relationNames[7].name}</Text>
                </TouchableHighlight>
            </View>

            <DialogInput isDialogVisible={this.state.otherDialogVisible}
                  title={"Please enter"}
                  message={""}
                  hintInput ={""}
                  multiline={true}
                  numberOfLines={4}
                  submitInput={ (inputText) => {
                        this.setState({otherLocationName: inputText, otherDialogVisible: false});
                    }
                  }
                  closeDialog={ () => {this.setState({otherDialogVisible:false})}}>
            </DialogInput>

        </View>


    );
  }
}

const styles = StyleSheet.create({
  unselectedStyle: {
          backgroundColor: "white",
          padding: 2,
          margin:2,
          borderWidth:.5
  },
  selectedStyle: {
        backgroundColor: "springgreen",
        padding: 2,
        margin:2,
        borderWidth:.5
    },

  rowView: {
     flex: 1,
     flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'stretch',
  },
  itemTextStyle: {
    fontSize:20,
  },

});