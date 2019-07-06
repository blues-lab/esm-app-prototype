import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, ScrollView} from 'react-native';
import * as RNFS from 'react-native-fs';
import DialogInput from 'react-native-dialog-input';

import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';



export default class ServiceDetailsScreen extends React.Component {

  static navigationOptions = {
    title: 'Services',
  };

  state = {
    serviceCategoryJS: {},
    serviceNames: [],
    isAddServiceDialogVisible:false,
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

  constructor(props) 
  {
    super(props);
  }

  loadServiceNames(servicesJS)
  {
    // load service names in array from JSON object passed by parent
    _serviceNames = []
    for (var i=0; i< servicesJS.length; i++)
    {
        _serviceNames.push
        (
          { id: servicesJS[i].serviceName,
            value: servicesJS[i].serviceName,
            selected: false,
            renderStyle: commonStyles.listItemStyle
          }
        );
    }

    return _serviceNames;
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const _serviceCategoryJS = navigation.getParam('serviceCategory', 'NO-SERVICE');
    this.setState({serviceCategoryJS: _serviceCategoryJS,
                   serviceCategoryName: _serviceCategoryJS.categoryName,
                   serviceNames: this.loadServiceNames(_serviceCategoryJS.services)
                 });
  }

  render() {
    return (
      <ScrollView>
          <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            }}>

            <View style={commonStyles.listContainerStyle}>
              <FlatList
                data={this.state.serviceNames}
                ItemSeparatorComponent={this.FlatListItemSeparator}
                renderItem={({ item }) => (
                  <View>
                    <Text
                      style={commonStyles.listItemStyle}
                      onPress={this.GetItem.bind(this, 'Id : '+item.id+' Value : '+item.value)}>
                      {item.value}
                    </Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>

            <Button title="Add new"
                onPress={() => this.setState({isAddServiceDialogVisible:true})}
            />



            <DialogInput isDialogVisible={this.state.isAddServiceDialogVisible}
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

                    this.setState({serviceNames:serviceNames, isAddServiceDialogVisible:false});
                  }
                }
                closeDialog={ () => {this.setState({isAddServiceDialogVisible:false})}}>
            </DialogInput>

          </View>

      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({

});