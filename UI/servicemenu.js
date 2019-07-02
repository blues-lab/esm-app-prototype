import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList} from 'react-native';
import * as RNFS from 'react-native-fs';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';



export default class ServiceMenuScreen extends React.Component {

  state = {
    services: "No services found", serviceCategoryNames: [],
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
    Alert.alert(item);
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
          {id: serviceCategories[i].categoryName, 
            value: serviceCategories[i].categoryName }
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
      //<View style={{ flex: 1, alignItems: 'top', justifyContent: 'center' }}>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}>
        <Text style={styles.longtextstyle}>
          Imagine an always-listening voice assistant called Mimi 
          recorded an audio when you were talking. Please select all 
          services that are relevant to this 
          audio recording that could provide to you. 
          You can also add new services without list. 
        </Text>
        
        <View style={styles.MainContainer}>
          <FlatList
            data={this.state.serviceCategoryNames}
            ItemSeparatorComponent={this.FlatListItemSeparator}
            renderItem={({ item }) => (
              <View>
                <Text
                  style={styles.item}
                  onPress={this.GetItem.bind(this, 'Id : '+item.id+' Value : '+item.value)}>
                  {item.value}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        
      </View>


    );
  }
}

const styles = StyleSheet.create({
  longtextstyle: {
    color: 'black',
    fontFamily:'Times New Roman',
    //fontWeight: 'bold',
    fontSize: 16,
    borderColor: 'black',
    paddingRight:30,
    paddingLeft:30,
    paddingTop:20
    //paddingBottom:
    //borderWidth: 1
  },
 MainContainer: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 30,
  },
 
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});