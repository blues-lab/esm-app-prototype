import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, ScrollView, Image,
 TextInput, Alert, FlatList, TouchableHighlight, TouchableOpacity,
 Modal} from 'react-native';
import * as RNFS from 'react-native-fs';


import ElevatedView from 'react-native-elevated-view';
import Dialog from 'react-native-dialog';
import DialogInput from 'react-native-dialog-input';


import ServicePermissionScreen from './servicePermission'

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';





export default class ServiceMenuScreen extends React.Component {

  static navigationOptions = {
    title: 'Service categories',
  };

  state = {
    services: "No services found", serviceCategoryNames: [],
    newCategoryDialogVisible:false,
    noRelevantDialogVisible:false,
    saveButtonEnabled:true,
    modalVisible:false,
    activeServiceName:"service"
  };

  FlatListItemSeparator = () => 
  {
    return (
      //Item Separator
      <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
    );
  }

  GetItem(item) 
  {
    //Function for click on an item
    this.props.navigation.navigate('ServiceDetails', 
      {
        serviceCategory: item.value
      });
  }


  handleCancel = () => {
    this.setState({ noRelevantDialogVisible: false });
  };

  saveNoRelevantServiceReason= () => {
  //Alert.alert("hi");
    this.setState({ noRelevantDialogVisible: false });
  };

  openModal= ()=> {
  //Alert.alert("hel");
    this.setState({modalVisible:true});
  };

  closeModal= ()=> {
    this.setState({modalVisible:false});
  }

  readServiceFile()
  {
    serviceCategoryNames = [];
    

    RNFS.readFile(serviceFileLocal)
    .then((res) => {

      serviceCategories = JSON.parse(res).serviceCategories;
      serviceCategoryNames=[];
      for(var i=0; i<serviceCategories.length; i++)
      {
        serviceCategoryNames.push
        (
          { id: serviceCategories[i].categoryName, 
            value: serviceCategories[i].categoryName,
            selectedServices: [] }
        );
      }
      
      this.setState
      (
        {
          services: JSON.parse(res), 
          serviceCategoryNames: serviceCategoryNames
        }
      );

      

    })  
    .catch((err) => {
      Alert.alert("Error: "+err.code,err.message);
    })

  }

  constructor(props) 
  {
    super(props);
  }



  componentDidMount()
  {
    this.readServiceFile();
    //Alert.alert("Services", "abc: "+this.state.serviceCategoryNames.length);
  }

  render() {
    return (
    <ScrollView>

      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          backgroundColor:'lavender'
        }}>

        <View style={styles.longTextView}>
            <Text style={styles.longtextstyle}>
              Imagine an always-listening voice assistant called Mimi
              recorded an audio when you were talking. Please select all
              services that are <Text style={{fontWeight: "bold"}}>relevant</Text> to this
              audio recording that could provide to you.
              You can also add new services.
            </Text>
        </View>


        <View style={styles.MainContainer}>
          <FlatList
            data={this.state.serviceCategoryNames}
            ItemSeparatorComponent={this.FlatListItemSeparator}
            renderItem={({ item }) => (
              <View>
                <Text
                  style={styles.item}
                  onPress={this.GetItem.bind(this, item)}>
                  {item.value}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>


        <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                marginTop:2,
                                          marginBottom:2
              }}>

                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop:2,
                  marginBottom:2
                  }}>

                  <TouchableHighlight style ={{
                        height: 40,
                        width:160,
                        borderRadius:10,
                        marginLeft:5,
                        marginRight:5,
                        marginTop:2,
                        marginBottom:2
                      }}>
                        <Button title="Add new"
                            color="#20B2AA"
                            onPress={() => this.setState({newCategoryDialogVisible:true})}
                        />
                  </TouchableHighlight>

                  <TouchableHighlight style ={{
                          height: 40,
                          width:160,
                          borderRadius:10,
                          marginLeft:5,
                          marginRight:5,
                          marginTop:2,
                          marginBottom:2
                        }}>
                      <Button disabled = {!this.state.saveButtonEnabled}
                        onPress={() => this.props.navigation.navigate('ServicePermission',
                                            {serviceName:this.state.activeServiceName})}
                        title="Save"
                        color="#20B2AA"
                        accessibilityLabel="Next"
                      />
                    </TouchableHighlight>
                </View>

            <Button
              title="No relevant service"
              color="#D8BFD8"
              onPress={() => this.setState({noRelevantDialogVisible:true})}
            />
        </View>

        <DialogInput isDialogVisible={this.state.newCategoryDialogVisible}
            title={"Add new service category"}
            message={""}
            hintInput ={""}
            multiline={true}
            numberOfLines={4}
            submitInput={ (inputText) => 
              {
                serviceCategoryNames = this.state.serviceCategoryNames;
                serviceCategoryNames.push
                (
                  { id: inputText,
                    value: inputText }
                );

                this.setState({serviceCategoryNames:serviceCategoryNames, newCategoryDialogVisible:false});
              }
            }
            closeDialog={ () => {this.setState({newCategoryDialogVisible:false})}}>
        </DialogInput>

      </View>

      <Dialog.Container visible={this.state.noRelevantDialogVisible}>
                <Dialog.Title>Please explain why no service would be relevant in this situation.</Dialog.Title>
                <Dialog.Input
                    multiline={true}
                    numberOfLines={4}
                    style={{height: 300, borderColor: 'lightgray', borderWidth: 1}}
                    />
                <Dialog.Button label="Cancel" onPress={this.handleCancel}/>
                <Dialog.Button label="Save" onPress={this.saveNoRelevantServiceReason} />
      </Dialog.Container>


      </ScrollView>


    );
  }
}


const styles = StyleSheet.create({

  longTextView:{
  elevation: 10,
  backgroundColor:'#a7f1e9',
  marginLeft: 15,
      marginRight: 15,
      marginBottom:5,
      marginTop:10,
  },
  longtextstyle: {
    //color: 'black',
    fontFamily:'Times New Roman',
    backgroundColor:'#a7f1e9',
    fontSize: 20,
    borderColor: 'black',
    paddingRight:20,
    paddingLeft:20,
    paddingTop:5,
    paddingBottom:5,
    marginLeft: 15,
    marginRight: 15,
    marginBottom:5,
    marginTop:10,

    //paddingBottom:
    // borderWidth: 1
  },
 MainContainer: {
 //elevation: 30,
    justifyContent: 'center',
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 1,
    marginTop: 5,
    //borderWidth:1,
    backgroundColor:"lightcyan",
    paddingBottom:2,
    paddingTop:2,
  },
 
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  }

});