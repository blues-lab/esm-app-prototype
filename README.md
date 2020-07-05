Install the latest version of NodeJS.
Make sure your npm is at least version 6.14.4.
Make sure your android SDK is the latest version
Make sure your Java JDK is pointing to the most recent version.
Within the root directory, run npm install -g react-native
Run npm install
Run react-native-background-job
Run react-native link react-native-fs
Run npm install react-native-screens --save
Run react-native link react-native-screens

We need sentry. Two ways to do this:
Run react-native link @sentry/react-native

If the above instruction didn't work, try
Run npm install @sentry/react-native --save
Run sentry-wizard
Follow the instructions

Go to android/gradle/wrapper/gradle-wrapper.properties
change distributionUrl = https\://services.gradle.org/distributions-6.1.1-all.zip

In notificationController.js in controllers folder,
at the very bottom of the file set requestPermissions : Platform.OS == 'ios'

Calling npx react-native run-android should work in the home directory now.