export const MIMI_ADVERTISEMENT =
  "MiMi is an always-listening voice assistant, which is always ready" +
  " to help and provide services/suggestions" +
  " based on conversations you have with other people at your home without waiting for a wake-word.\n\n" +
  "The surveys in this app help improve MiMi's design." +
  " You'll receive a notification when a new survey becomes available.";

export const WIFI_PERMISSION_MSG =
  "We will not collect or store your location data." +
  " However, for the app to send you surveys only when you are at home, we need you to:\n" +
  " • grant the app location permission\n" +
  " • keep location sharing enabled at home throughout the study.";

export const HOME_WIFI_NOT_CONNECTED =
  "We will only send surveys when you are connected to your home WiFi." +
  " We will check again when you are connected to WiFi network.";

export const HOME_WIFI_PROMPT = wifiName =>
  'Is "' + wifiName + '" your home WiFi?';

export const NOT_HOME_WIFI =
  "Got it. We'll ask again when you connect to another network.";

export const INVITATION_CODE_FAIL =
  "There was an error saving your invitation code. Please try again later.";

export const DONT_DISTURB =
  "If there is a specific time of day you don't want to receive surveys, " +
  "please indicate it below.";

export const SAVE_CHANGES_PROMPT = "Do you want to save changes?";

export const SURVEY_EXPIRED =
  "Sorry, the current survey expired. We will notify you once new surveys become available.";

export const TALKING_ABOUT = "What were you talking about?";
export const TALKING_ABOUT_SKIP_HINT = "Enter 'Prefer not to answer' to skip";

export const ANSWER_TO_CONTINUE = "Please answer all questions to continue.";

export const SAVING_WAIT = "Saving response. Please wait...";

export const WOULD_ALLOW_1 =
  "Would you allow MiMi to access the relevant parts of the conversation you just had to";

export const RESTRICT_WHICH =
  "To which specific parts of your conversation would you restrict MiMi's access?";
export const RESTRICT_WHY =
  "Why would you restrict the device's access to these parts of your conversation?";

export const WHY_DENY =
  "Why would you completely deny access to the conversation?";

export const EXIT_SURVEY_INTRO = _remainingDays =>
  "Thank you for participating in the daily surveys!\n" +
  "There is one more survey you can take and earn $1!!!\n\n" +
  "You have " +
  _remainingDays +
  " days to complete this survey.";

export const EXIT_SURVEY_CONSENT =
  "Welcome to the final part of the study! \n\n" +
  "In this survey, we will ask questions about the importance of " +
  "the services that you have selected in the past weeks.\n\n" +
  "This survey will take 8-10 minutes and you will receive $1 for completing it.";

export const LOCATION_SHARE_PROMPT =
  "To receive survey, please enable location sharing and WiFi.";

//********* Exit survey related texts ************//

export const MODEL1_FEATURES = [
  "• used to provide the relevant services",
  "• stored until the relevant service is provided",
  "• processed and analyzed directly on the device",
  "• processed and analyzed by algorithms"
];

export const MODEL2_FEATURES = [
  "• used to provide the relevant services and personalized offers from companies other than the manufacturer of the device",
  "• stored forever",
  "• processed and analyzed after being sent over the Internet to the manufacturer’s server",
  "• processed and analyzed by humans"
];

export const SINGLE_MODEL_INTRO_TEXT =
  "Suppose you could actually buy a real version of MiMi, which " +
  "offered the services you suggested during the past week. It would also have additional features." +
  " To provide them, audio recordings are:";
export const BOTH_MODEL_INTRO_TEXT =
  "Suppose you could actually buy a real version of MiMi, which" +
  " offered the services you suggested during the past week as well as additional features. Imagine" +
  " there are two models of MiMi.";

export const EXPLAIN_WHY_NO_SERVICES =
  "Please explain in a few sentences why you did not find any services relevant.";
//********* End exit survey related texts ************//

export const FINAL_THANK = "Thank you for participating in our study!";

export const SERVICES = [
  {
    services: [
      { serviceName: "Call doctor/hospital" },
      { serviceName: "Call the police/emergency service" },
      { serviceName: "Call/text/email a family member/friend" },
      { serviceName: "Call/text/email a collegue" },
      { serviceName: "Call a store/restaurant/office" }
    ],
    categoryName: "Call/email/text"
  },
  {
    services: [
      {
        serviceName:
          "Keep track of the price of some item and notify when lower price available"
      },
      {
        serviceName:
          "Keep track of medication/exercise/other recurrent activities "
      },
      {
        serviceName:
          "Keep track of the flight ticket and notify when lower price available"
      },
      {
        serviceName: "Add task in a to-do list and remind at appropriate time"
      },
      { serviceName: "Add event in calendar and remind at appropriate time" },
      { serviceName: "Track a package shipping and confirm when delivered" },
      {
        serviceName:
          "Keep track of the opinion/preference expressed in this conversation"
      },
      { serviceName: "Keep track of travel schedules" }
    ],
    categoryName: "Tracking"
  },
  {
    services: [
      { serviceName: "Remind about doctor's/medical appointment" },
      { serviceName: "Remind to call/text/email someone" },
      { serviceName: "Remind about a meeting" },
      { serviceName: "Remind about a to-do item" },
      { serviceName: "Remind to take medication" },
      { serviceName: "Remind to avoid some food/drink" },
      { serviceName: "Remind about a calendar event" }
    ],
    categoryName: "Set a reminder"
  },
  {
    services: [
      { serviceName: "Adjust heating/cooling" },
      { serviceName: "Start/stop music" },
      { serviceName: "Turn on/off the oven" },
      { serviceName: "Open/close garage door" },
      { serviceName: "Turn on/off the light" }
    ],
    categoryName: "Smart home services"
  },
  {
    services: [
      {
        serviceName:
          "Search for health/disease/medical condition related information"
      },
      { serviceName: "Search for the nearest hospital/pharmacy" },
      { serviceName: "Search for the nearest restaurant" },
      { serviceName: "Search for food recipe" },
      { serviceName: "Search for song/artist/lyric" },
      {
        serviceName: "Search contact information for a store/restaurant/office"
      },
      {
        serviceName:
          "Search for promo code/discount offer for some product/service"
      },
      { serviceName: "Search for job opportunities" },
      { serviceName: "Search for travel info (flights/hotels/rental cars)" },
      { serviceName: "Search for weather information at a location" },
      { serviceName: "Search for the nearest library" },
      { serviceName: "Search for meanings of a word/term/phrase" }
    ],
    categoryName: "Search for information"
  },
  {
    services: [
      { serviceName: "Recommend a restaurant/food delivery store" },
      { serviceName: "Suggest a gift store/item" },
      { serviceName: "Recommend music, movie, or other media" },
      { serviceName: "Recommend medication and place to find it" },
      { serviceName: "Recommend activities/happenings nearby" },
      { serviceName: "Recommend dietary plan" },
      { serviceName: "Recommend the optimal route for a destination" }
    ],
    categoryName: "Recommend product/service"
  },
  {
    services: [
      { serviceName: "Make doctor's/medical appointment" },
      { serviceName: "Schedule a meeting with a colleague" },
      { serviceName: "Schedule a get together with friends/family" },
      {
        serviceName:
          "Schedule personal care appointment (hair, nails, spa, etc.)"
      }
    ],
    categoryName: "Add calendar event"
  },
  {
    services: [
      { serviceName: "Order food" },
      { serviceName: "Order gift item" },
      { serviceName: "Book flight/hotel/rent car" },
      { serviceName: "Buy clothes" },
      { serviceName: "Buy book" },
      { serviceName: "Order a taxi/ride share" }
    ],
    categoryName: "Purchase a product/service"
  }
];
