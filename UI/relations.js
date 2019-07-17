import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight, Image} from 'react-native';
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

const checkBoxWidth=25;
const checkBoxHeight=25;

export default class Relations extends React.Component {

  state={familySelected:false, friendSelected:false, acquaintanceSelected:false, colleaguesSelected:false,
         roommatesSelected:false, workerSelected:false, unknownSelected:false, selectedRelations:[],
         otherDialogVisible: false, otherRelationName:'',
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
    _relationNames[index].selected = !_relationNames[index].selected;
    _name = _relationNames[index].name;
    _selected = _relationNames[index].selected;
    if(_selected)
    {
        //_relationNames[index].renderStyle = styles.selectedStyle;
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
        `relation: ${_relationNames[index].name}, selected: ${_relationNames[index].selected}`);

    this.setState({relationNames: _relationNames});

    if(_name != 'Other')
    {
        this.props.relationSelectionHandler(_name, _selected);
    }
    else
    {
        this.props.relationSelectionHandler(this.state.otherRelationName, _selected);
    }

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
                    <View style={styles.rowView}>
                        <Image
                            style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                            source={this.state.relationNames[0].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                        />
                        <Text style={styles.itemTextStyle}>{this.state.relationNames[0].name}</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[1].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 1)
                    }>
                  <View style={styles.rowView}>
                      <Image
                          style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                          source={this.state.relationNames[1].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                      />
                      <Text style={styles.itemTextStyle}>{this.state.relationNames[1].name}</Text>
                  </View>
                </TouchableHighlight>

            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[2].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 2)
                    }>
                  <View style={styles.rowView}>
                      <Image
                          style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                          source={this.state.relationNames[2].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                      />
                      <Text style={styles.itemTextStyle}>{this.state.relationNames[2].name}</Text>
                  </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[3].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 3)
                    }>
                  <View style={styles.rowView}>
                      <Image
                          style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                          source={this.state.relationNames[3].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                      />
                      <Text style={styles.itemTextStyle}>{this.state.relationNames[3].name}</Text>
                  </View>
                </TouchableHighlight>
            </View>


            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[4].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 4)
                        }>
                     <View style={styles.rowView}>
                         <Image
                             style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                             source={this.state.relationNames[4].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                         />
                         <Text style={styles.itemTextStyle}>{this.state.relationNames[4].name}</Text>
                     </View>
                </TouchableHighlight>

            </View>
            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[5].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 5)
                    }>
                  <View style={styles.rowView}>
                       <Image
                           style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                           source={this.state.relationNames[5].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                       />
                       <Text style={styles.itemTextStyle}>{this.state.relationNames[5].name}</Text>
                  </View>
                </TouchableHighlight>
            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.relationNames[6].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this,6)
                        }>
                 <View style={styles.rowView}>
                     <Image
                         style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                         source={this.state.relationNames[6].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                     />
                     <Text style={styles.itemTextStyle}>{this.state.relationNames[6].name}</Text>
                 </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.relationNames[7].renderStyle}
                            onPress={
                                  this.handleSelectionChange.bind(this, 7)
                            }>
                <View style={styles.rowView}>
                     <Image
                         style={{width: checkBoxWidth, height: checkBoxHeight,  resizeMode : 'contain' , margin:1}}
                         source={this.state.relationNames[7].selected?require('../res/checked.png'):require('../res/unchecked.png')}
                     />
                     <Text style={styles.itemTextStyle}>{this.state.relationNames[7].name}</Text>
                 </View>
                </TouchableHighlight>
            </View>

            <DialogInput isDialogVisible={this.state.otherDialogVisible}
                  title={"Please enter"}
                  message={""}
                  hintInput ={""}
                  multiline={true}
                  numberOfLines={4}
                  submitInput={ (inputText) => {
                        this.props.relationSelectionHandler(inputText,true);
                        this.setState({otherRelationName: inputText, otherDialogVisible: false});
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
        backgroundColor: "darkseagreen",
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