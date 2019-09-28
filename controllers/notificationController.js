import { Platform } from "react-native";
import logger from "./logger";

const PushNotification = require("react-native-push-notification");

const codeFileName = "notificationController.js";

export function onAppOpen() {
  logger.info(codeFileName, "onAppOpen", "Calling backCallBack.");
  onAppOpen.backCallBack();
}

class NotificationController {
  cancelNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  showNotification(promptTitle, promptMessage) {
    PushNotification.localNotification({
      date: new Date(),
      /* Android Only Properties */
      id: "0", // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      //bigText: "big text ", // (optional) default: "message" prop
      //subText: "subText", // (optional) default: none
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: "some_tag", // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      //priority: "high", // (optional) set notification priority, default: high
      visibility: "private", // (optional) set notification visibility, default: private
      //importance: "high", // (optional) set notification importance, default: high

      /* iOS only properties */
      //      alertAction: // (optional) default: view
      //      category: // (optional) default: null
      //      userInfo: // (optional) default: null (object containing additional notification data)

      /* iOS and Android properties */
      title: promptTitle, // (optional)
      message: promptMessage, // (required)
      playSound: true, // (optional) default: true
      soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: "10" // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      //repeatType: 'day', // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
      //actions: '["Yes", "No"]',  // (Android only) See the doc for notification actions to know more
    });
  }

  configureNotification() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister(token) {
        console.log("TOKEN:", token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification(notification) {
        logger.info(
          `${codeFileName}`,
          "onNotification",
          "App opened from notification: " + JSON.stringify(notification)
        );

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        if (Platform.OS === "ios") {
          //notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
        onAppOpen();
      },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "YOUR GCM (OR FCM) SENDER ID",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true
    });
  }
}
const notificationController = new NotificationController();
notificationController.configureNotification();
export default notificationController;
