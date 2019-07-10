import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';

const logFilePath= RNFS.DocumentDirectoryPath+'/log.csv';

class Logger extends Component
{
    setup()
    {

        RNFS.exists(logFilePath)
            .then( (exists) => {
                if (exists)
                {

                }
                else
                {
                    RNFS.writeFile(logFilePath,'Type,ClassName,FunctionName,Message,Time\n')
                        .then((success) =>
                        {
                           // Alert.alert("Setup log file","created log file:"+logFilePath)
                        })
                        .catch((err) =>
                        {
                            Alert.alert("Error: "+err.code,err.message);
                        })
                }
            });
    }

    getDateTime()
    {
        date = new Date();
        var day = date.getDate();
        var m = date.getMonth() + 1; //Month from 0 to 11
        var y = date.getFullYear();

        var time = date.getHours() + ":" + date.getMinutes()+ ':' + date.getSeconds()+':'+date.getMilliseconds();

        return day+'-'+m+'-'+y+' '+time
    }

    writeLog(type, className, funcName, message)
    {
       RNFS.appendFile(logFilePath,
                    type +','+
                    className+','+
                    funcName+','+
                    message+','+
                    this.getDateTime()+'\n'
               )
            .then((success) =>
            {
            })
            .catch((err) =>
            {
                Alert.alert("Error writing in log file",err.message);
            })

    }

    info(className, funcName, message)
    {
        this.writeLog('Info', className, funcName, message);
    }

    warn(className, funcName, message)
    {
        this.writeLog('Warning', className, funcName, message);
    }

    error(className, funcName, message)
    {
        this.writeLog('Error', className, funcName, message);
    }

    showLog()
    {
         RNFS.readFile(logFilePath)
                .then((res) => {
                      Alert.alert("Log", res);
                })
                .catch((err) => {
                  Alert.alert("Error showing log file", err.message)
                })
    }


    emailLog()
    {
      const to = ['rakhasan@u.edu'] // string or array of email addresses
              email(to, {
                  // Optional additional arguments
                  //cc: ['bazzy@moo.com', 'doooo@daaa.com'], // string or array of email addresses
                  //bcc: 'mee@mee.com', // string or array of email addresses
                  subject: 'Show how to use',
                  body: 'Some body right here'
              }).catch(err => Alert.alert("Er",err.message))
    }

    sendGoogle()
    {
        var _from = "peacefuldeath777@gmail.com";
        RNSmtpMailer.sendMail({
          mailhost: "smtp.gmail.com",
          port: "465",
          ssl: true, //if ssl: false, TLS is enabled,**note:** in iOS TLS/SSL is determined automatically, so either true or false is the same
          username: "peacefuldeath777",
          password: "RAFSAN))&",
          from: _from,
          recipients: "rakhasan@iu.edu",
          subject: "ALVA log",
          htmlBody: "<h1>header</h1><p>body</p>",
          attachmentPaths: [
            //RNFS.DocumentDirectoryPath+'/log.csv'
          ],
          attachmentNames: [
           // "log.csv"
          ], //only used in android, these are renames of original files. in ios filenames will be same as specified in path. In ios-only application, leave it empty: attachmentNames:[]
          attachmentTypes: [
            //'csv'
          ] //needed for android, in ios-only application, leave it empty: attachmentTypes:[]. Generally every img(either jpg, png, jpeg or whatever) file should have "img", and every other file should have its corresponding type.
        })
          .then(success => Alert.alert("Success"))
          .catch(err => Alert.alert("Sending email failed from: "+_from,err.toString()));

        Alert.alert("Sent google");
    }

    sendYahoo()
    {
          var _from = "bulbulbabul2@yahoo.com";
                RNSmtpMailer.sendMail({
                  mailhost: "smtp.mail.yahoo.com",
                  port: "465",
                  ssl: true, //if ssl: false, TLS is enabled,**note:** in iOS TLS/SSL is determined automatically, so either true or false is the same
                  username: "bulbulbabul2",
                  password: "bulbulerpassword",
                  from: _from,
                  recipients: "rakhasan@iu.edu",
                  subject: "ALVA log",
                  htmlBody: "<h1>header</h1><p>body</p>",
                  attachmentPaths: [
                    //RNFS.DocumentDirectoryPath+'/log.csv'
                  ],
                  attachmentNames: [
                   // "log.csv"
                  ], //only used in android, these are renames of original files. in ios filenames will be same as specified in path. In ios-only application, leave it empty: attachmentNames:[]
                  attachmentTypes: [
                    //'csv'
                  ] //needed for android, in ios-only application, leave it empty: attachmentTypes:[]. Generally every img(either jpg, png, jpeg or whatever) file should have "img", and every other file should have its corresponding type.
                })
                  .then(success => Alert.alert("Success"))
                  .catch(err => Alert.alert("Sending email failed from: "+_from,err.toString()));

                Alert.alert("Sent yahoo");
    }

    uploadLog()
    {

         RNFS.readFile(logFilePath)
            .then((res) => {
                  this.uploadLogText(res);
            })
            .catch((err) => {
              Alert.alert("Error showing log file", err.message)
            })
    }

    uploadLogText(text)
    {
        fetch('https://postb.in/1562720582685-9259188782889', { // Your POST endpoint
                    method: 'POST',
                    headers: {
                      // Content-Type may need to be completely **omitted**
                      // or you may need something
                      "Content-Type": "application/csv"
                    },
                    body: text // This is your file object
                      }).then(
                        response => Alert.alert("Respone",response.toString()) // if the response is a JSON object
                      ).then(
                        success => Alert.alert('Log file uploaded')// Handle the success response object
                      ).catch(
                        err => Alert.alert(err.code, err.message) // Handle the error response object
                      )
                      .catch(err => Alert.alert(err.code, err.message))
    }
}



const logger = new Logger();
logger.setup();
export default logger;