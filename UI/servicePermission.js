import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


 var radioOptions = [
    {label: 'Yes, I will allow access to any relevant parts of the conversation', value: 0 },
    {label: 'I will only allow access if I could censor certain parts of the relevant conversation', value: 1 },
    {label: 'No, I will not allow access to any relevant parts of the conversation', value:2}
  ];


export default class ServicePermissionScreen extends React.Component {

  state={serviceName:"NO-SERVICE", selectedValue:0, notAtAllSelected:false, partsSelected:false}


  constructor(props) 
  {
    super(props);
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const serviceName = navigation.getParam('serviceName', 'NO-SERVICE');
    this.setState({serviceName: serviceName});
  }

  selectionChanged(value)
  {
    if(value==0)
    {
        this.setState({partsSelected:false, notAtAllSelected:false})
    }
    if(value==1)
    {
        this.setState({partsSelected:true, notAtAllSelected:false})
    }
    if(value==2)
    {
        this.setState({notAtAllSelected:true, partsSelected:false})
    }
  }

  render() {
    return (
    <View>
    <ScrollView>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginRight:10,
          marginLeft:10,
          backgroundColor:'lightcyan',
          }}>

          <Text style={styles.questionStyle}>
            Would you allow MiMi to access the relevant parts of
            the conversation to provide you the service {this.state.serviceName}?
          </Text>
          <RadioForm style={styles.radioFrameStyle}
              radio_props={radioOptions}
              initial={0}
              onPress={(value) => this.selectionChanged(value)}
          />

          { this.state.partsSelected &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.questionStyle}>What parts would you not allow the device to access?</Text>
                <TextInput
                    multiline={true}
                    numberOfLines={4}
                    style={styles.inputStyle}
                    onChangeText={(text) =>
                      this.setState({ conversationTopic: text })

                    }
                    value={this.state.conversationTopic}
                />

                <Text style={styles.questionStyle}>Why would you not allow the device to access these parts?</Text>
                <TextInput
                    multiline={true}
                    numberOfLines={4}
                    style={styles.inputStyle}
                    onChangeText={(text) =>
                      this.setState({ conversationTopic: text })

                    }
                    value={this.state.conversationTopic}
                />

            </View>
          }

          { this.state.notAtAllSelected &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.questionStyle}>Why would you not allow to access the relevant conversation? </Text>
                <TextInput
                    multiline={true}
                    numberOfLines={4}
                    style={styles.inputStyle}
                    onChangeText={(text) =>
                      this.setState({ conversationTopic: text })

                    }
                    value={this.state.conversationTopic}
                />
            </View>
          }


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
              onPress={() => Alert.alert("saved")}
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