import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList} from 'react-native';




export default class ServiceMenuScreen extends React.Component {

  constructor(props) {
    super(props);

    // this.state = { 
    //   conversationTopic: '', height:50,
    // };

    this.state = {
      conversationTopic: '', height:50,
      FlatListItems: [
         { id: '1', value: 'A' },{ id: '2', value: 'B' },{ id: '3', value: 'C' },
         { id: '4', value: 'D' },{ id: '5', value: 'E' },{ id: '6', value: 'F' },
         { id: '7', value: 'G' },{ id: '8', value: 'H' },{ id: '9', value: 'I' },
         { id: '10', value: 'J' },{ id: '11', value: 'K' },{ id: '12', value: 'L' },
         { id: '13', value: 'M' },{ id: '14', value: 'N' },{ id: '15', value: 'O' },
         { id: '16', value: 'P' },{ id: '17', value: 'Q' },{ id: '18', value: 'R' },
         { id: '19', value: 'S' },{ id: '20', value: 'T' },{ id: '21', value: 'U' },
         { id: '22', value: 'V' },{ id: '23', value: 'W' },{ id: '24', value: 'X' },
         { id: '25', value: 'Y' },{ id: '26', value: 'Z' }],
    };
  }

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
    );
  }

    GetItem(item) {
    //Function for click on an item
    Alert.alert(item);
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
            data={this.state.FlatListItems}
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