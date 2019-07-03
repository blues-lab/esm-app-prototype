import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList} from 'react-native';
import * as RNFS from 'react-native-fs';

import DialogInput from 'react-native-dialog-input';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';



export default class ServiceDetailsScreen extends React.Component {

  static navigationOptions = {
    title: 'Services',
  };

  state = {
    services:'.',serviceCategory: "..", serviceNames: [],
    isDialogVisible:false
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
    //Alert.alert(item);
  }

  readServiceFile()
  {
    serviceCategoryNames = [];
    

    RNFS.readFile(serviceFileLocal)
    .then((res) => {

      serviceCategories = JSON.parse(res).serviceCategories;
      serviceNames=[];
      for(var i=0; i<serviceCategories.length; i++)
      {
        if (this.state.serviceCategory==serviceCategories[i].categoryName)
        {
          //Alert.alert('found1:',this.state.serviceCategory);
          services = serviceCategories[i].services;
          for(var j=0; j< services.length; j++)
          {
            serviceNames.push
            (
              {id: services[j].serviceName, 
                value: services[j].serviceName }
            );
          }
        }
      }      
      
      this.setState
      (
        {
          services: res, 
          serviceNames: serviceNames
        }
      );

      //Alert.alert('found:',":"+serviceNames.length);

    })  
    .catch((err) => {
      Alert.alert("Error: "+err.code,err.message);
    })

  }

  constructor(props) 
  {
    super(props);
    //Alert.alert('props:',props.itemId);
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const serviceCategory = navigation.getParam('serviceCategory', 'NO-SERVICE');
    this.setState({serviceCategory: serviceCategory});

    this.readServiceFile();
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
        
        <View style={styles.MainContainer}>
          <FlatList
            data={this.state.serviceNames}
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

        <Button title="Add new"
        onPress={() => this.setState({isDialogVisible:true})}
        />

        <DialogInput isDialogVisible={this.state.isDialogVisible}
            title={"Enter new service"}
            message={""}
            hintInput ={""}
            submitInput={ (inputText) => 
              {
                serviceNames = this.state.serviceNames;
                serviceNames.push
                (
                  {id: inputText,
                    value: inputText }
                );

                this.setState({serviceNames:serviceNames, isDialogVisible:false});
              }
            }
            closeDialog={ () => {this.setState({isDialogVisible:false})}}>
        </DialogInput>
        
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