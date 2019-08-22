import * as RNFS from 'react-native-fs';

export const SERVICE_FILE_ASSET = 'services.js';
export const SERVICE_FILE_LOCAL = RNFS.DocumentDirectoryPath+'/services.js';


export const SURVEY_STATUS =  {NOT_AVAILABLE: "NOT_AVAILABLE", AVAILABLE:"AVAILABLE", ONGOING:"ONGOING", COMPLETED:"COMPLETED"}

export const MAX_SURVEY_PER_DAY = 5; //create max 5 surveys/day

export const  SURVEY_ALLOWED_TO_COMPLETE = 1; //allow to complete max 1 surveys/day

export const PROMPT_DURATION = 60; //60 minutes

export const USER_SETTINGS_FILE_PATH = RNFS.DocumentDirectoryPath+'/usersettings.js';

export const INVITATION_CODE_FILE_PATH = RNFS.DocumentDirectoryPath+"/invitationCode.js";

export const APP_STATUS_FILE_PATH = RNFS.DocumentDirectoryPath+'/appStatus.js';

export const LOG_FILE_PATH = RNFS.DocumentDirectoryPath+'/log.csv';

export const STUDY_PERIOD = 3; //study will continue over n days


export const VERSION_NUMBER = '1.0.0';


//****************String constants ********************//
export const MIMI_ADVERTISEMENT="Advertisement/reminder for MIMI and suggestion to come back later."

export const WIFI_PERMISSION_MSG = "We will not collect or store your location data."+
                            " However, for the app to send you surveys only when you are at home, you are required to:\n"+
                            " • grant the app location permission \n"+
                            " • keep the location sharing enabled at home throughout the study";


export const PERMISSION_OPTIONS=
               [
                 'Yes, I will allow access to any relevant parts of the conversation.', // bold: "allow" and "any"
                 'I will partially restrict access to certain parts of the relevant conversation.', // bold: "partially restrict" and "certain"
                 'No, I will deny access to any relevant parts of the conversation.' // bold: "deny" and "any"
               ];

export const HOME_WIFI_NOT_CONNECTED = 'We will only send surveys when you are connected to your home WiFi.'+
                                       ' We will ask about it again when you are connected to WiFi.';

export const INVITATION_CODE_FAIL = 'There was an error saving invitation code. Please try again later.';

export const DONT_DISTURB = 'If there is specific time of the day you do not want to receive surveys,'  +
                                             ' while connected to the home WiFi, please indicate it below.'
//****************String constants ********************//










export const SERVICES = [{"categoryName": "Tracking", "services": [{"serviceName": "Keep track of the price of some item and notify when lower price available"}, {"serviceName": "Keep track of medication/exercise/other recurrent activities "}, {"serviceName": "Keep track of the flight ticket and notify when lower price available"}, {"serviceName": "Add task in a todo list and remind at appropriate time"}, {"serviceName": "Add event in calendar and remind at appropriate time"}, {"serviceName": "Keep track of work schedules for next 'N' days/weeks"}, {"serviceName": "Track a package shipping and confirm when delivered"}, {"serviceName": "Keep track of the opinion/preference expressed in this conversation"}, {"serviceName": "Keep track of travel schedules"}]}, {"categoryName": "Appointment", "services": [{"serviceName": "Make doctor's/medical appointment"}, {"serviceName": "Schedule a meeting with a colleague"}, {"serviceName": "Schedule a get together with friends/family"}, {"serviceName": "Schedule personal care appointment (hair, nails, spa, etc.)"}]}, {"categoryName": "Recommend", "services": [{"serviceName": "Recommend a restaurant/food delivery store"}, {"serviceName": "Suggest a gift store/item"}, {"serviceName": "Recommend music, movie, or other media"}, {"serviceName": "Recommend medication and place to find it"}, {"serviceName": "Recommend activities/happenings nearby"}, {"serviceName": "Recommend dietary plan"}, {"serviceName": "Recommend the optimal route for a destination"}]}, {"categoryName": "Smart home services", "services": [{"serviceName": "Adjust heating/cooling"}, {"serviceName": "Start/stop music"}, {"serviceName": "Turn on/off the oven"}, {"serviceName": "Open/close garage door"}, {"serviceName": "Turn on/off the light"}]}, {"categoryName": "Reminder", "services": [{"serviceName": "Remind about doctor's/medical appointment"}, {"serviceName": "Remind to call/text/email someone"}, {"serviceName": "Remind about a meeting"}, {"serviceName": "Remind about a todo item"}, {"serviceName": "Remind to take medication"}, {"serviceName": "Remind to avoid some food/drink"}]}, {"categoryName": "Shopping", "services": [{"serviceName": "Order food"}, {"serviceName": "Order gift item"}, {"serviceName": "Book flight/rent car"}, {"serviceName": "Book hotel"}, {"serviceName": "Buy clothes"}, {"serviceName": "Buy book"}]}, {"categoryName": "Search for information", "services": [{"serviceName": "Search for health/disease/medical condition related information"}, {"serviceName": "Search for the nearest hospital/pharmacy"}, {"serviceName": "Search for the nearest restaurant/library"}, {"serviceName": "Search for food recipe"}, {"serviceName": "Search for song/artist/lyric"}, {"serviceName": "Search contact information for a store/restaurant/office"}, {"serviceName": "Search for promo code/discount offer for some product/service"}, {"serviceName": "Search for job opportunities nearby"}, {"serviceName": "Search for flights/rental cars/hotels"}, {"serviceName": "Search information about college/university"}, {"serviceName": "Search for weather information at a location"}, {"serviceName": "Search for disease symptoms"}, {"serviceName": "Search for information based on the conversation"}, {"serviceName": "Search for meanings of a word/term/phrase"}]}, {"categoryName": "Communication", "services": [{"serviceName": "Call doctor/hospital"}, {"serviceName": "Call lawyer"}, {"serviceName": "Call the police/emergency service"}, {"serviceName": "Call/text/email a family member/friend"}, {"serviceName": "Call/text/email a collegue"}, {"serviceName": "Call a store/restaurant/office"}]}]