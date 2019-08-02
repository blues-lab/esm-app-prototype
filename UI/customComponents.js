import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TouchableHighlight} from 'react-native';

export default class CustomButton extends React.Component
{
    render()
    {
        return(
              <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight:10,
                marginLeft:10,
                backgroundColor:'green',
                }}>

                <TouchableHighlight
                    style ={{
                            height: 40,
                            width:160,
                            borderRadius:10,
                            marginLeft:5,
                            marginRight:5,
                            marginTop:10,
                            marginBottom:10
                          }}>

                    <Button title="hi"
                                onPress={() => this.props.navigation.navigate('ServiceMenu')}/>

                </TouchableHighlight>

              </View>

        );
    }
}

