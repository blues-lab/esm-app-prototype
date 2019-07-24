import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';
import logger from './logger';

const codeFileName = 'utilities.js';


class Utilities extends Component
{
    serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

   getWifiName()
   {
       _ssid = '';
       wifi.isEnabled((isEnabled) => {
         if (isEnabled)
         {
           wifi.connectionStatus((isConnected) => {
             if (isConnected) {
                 wifi.getSSID((ssid) => {
                   this.setState({msg: "Connected: "+ssid});
                   _ssid = ssid;
                 });
               } else {
                 this.setState({msg: "Not connected!"});
             }
           });

           this.setState({msg: "Wifi is enabled!"});
         }
         else
         {
           this.setState({msg: "Wifi not enabled!"});
         }
       });
       return _ssid;
   }


    writeJSONFile(content, fileName, callerClass, callerFunc)
    {
         RNFS.copyFile(fileName, fileName+'.backup')
             .then( (success) => {
                 logger.info(`${callerClass}`, 'writeServiceFile', 'Backed up service file.');

                 RNFS.writeFile(fileName, JSON.stringify(content))
                     .then( (success) => {
                         logger.info(`${callerClass}`, `${callerFunc}`, 'Saved service in file.');
                           RNFS.unlink(fileName+'.backup')
                               .then(() => {
                                 logger.info(`${callerClass}`, `${callerFunc}`, 'Deleted backup service file.');
                               })
                               // `unlink` will throw an error, if the item to unlink does not exist
                               .catch((err) => {
                                 logger.error(`${callerClass}`, `${callerFunc}`, 'Error in deleting backup service file:'+error.message);
                               });
                     })
                     .catch( (error)=>{
                         logger.error(`${callerClass}`, `${callerFunc}`, 'Error in saving service file:'+error.message+'. Restoring backup file');
                         RNFS.copyFile(fileName+'.backup', fileName)
                             .then( (success)=> {
                                 logger.info(`${callerClass}`, `${callerFunc}`, 'Restored backup service file.');
                             })
                             .catch( (error)=>{
                                 logger.error(`${callerClass}`, `${callerFunc}`, 'Failed to Restore backup service file:'+error.message);
                             })

                     })
             })
             .catch( (error) => {
                 logger.error(`${codeFileName}`, 'saveState',
                     'Error backing up status file:'+error.message);
             })
    }

    readJSONFile(filePath)
    {
          RNFS.exists(filePath)
            .then( (exists) => {
                if (exists)
                {
                    RNFS.readFile(this.serviceFileLocal)
                        .then((_fileContent) => {
                            return JSON.parse(_fileContent);
                        });
                }
            });

            return null;
    }

    readServiceFile()
    {
        _serviceCategories=[];

        RNFS.readFile(this.serviceFileLocal)
            .then((_fileContent) => {

              logger.info(`${codeFileName}`,"ReadServiceFile", 'Successfully read:'+this.serviceFileLocal);

              _serviceCategoriesJS = JSON.parse(_fileContent).serviceCategories;
              for(var i=0; i< _serviceCategoriesJS.length; i++)
              {
                _servicesJS = _serviceCategoriesJS[i].services;
                _services = [];
                for(var j=0; j< _servicesJS.length; j++)
                {
                    _services.push
                    (
                        {
                            id: _servicesJS[j].serviceName,
                            name: _servicesJS[j].serviceName,
                            selected: false
                        }
                    );
                }
                _serviceCategories.push
                (
                  {
                    id: _serviceCategoriesJS[i].categoryName,
                    name: _serviceCategoriesJS[i].categoryName,
                    services: _services
                  }
                );
              }

              logger.info(`${codeFileName}`,"ReadServiceFile", 'Number of categories found:'+_serviceCategories.length);

              return _serviceCategories;
            })
            .catch((err) => {
              logger.info(`${codeFileName}`,"ReadServiceFile", 'Failed to read:'+this.serviceFileLocal+". Err:"+err.message);
              return _serviceCategories;
            })

    }


}
const utilities = new Utilities();
export default utilities;