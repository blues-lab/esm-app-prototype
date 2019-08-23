//****************String constants ********************//
export const MIMI_ADVERTISEMENT="MiMi is an always-listening voice assistant, which is always ready" +
                    " to help and provide services/suggestions" +
                    " based on conversations you have with other people at your home without waiting for a wake-word.\n\n" +
                    "The surveys in this app help to improve MiMi's design."+
                    " You'll receive a notification when a new surveys becomes available."


export const WIFI_PERMISSION_MSG = "We will not collect or store your location data."+
                            " However, for the app to send you surveys only when you are at home, you are required to:\n"+
                            " • grant the app location permission\n"+
                            " • keep the location sharing enabled at home throughout the study.";


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










export const SERVICES = [{"services": [{"serviceName": "Call doctor/hospital"}, {"serviceName": "Call the police/emergency service"}, {"serviceName": "Call/text/email a family member/friend"}, {"serviceName": "Call/text/email a collegue"}, {"serviceName": "Call a store/restaurant/office"}], "categoryName": "Call/email/text"}, {"services": [{"serviceName": "Keep track of the price of some item and notify when lower price available"}, {"serviceName": "Keep track of medication/exercise/other recurrent activities "}, {"serviceName": "Keep track of the flight ticket and notify when lower price available"}, {"serviceName": "Add task in a to-do list and remind at appropriate time"}, {"serviceName": "Add event in calendar and remind at appropriate time"}, {"serviceName": "Track a package shipping and confirm when delivered"}, {"serviceName": "Keep track of the opinion/preference expressed in this conversation"}, {"serviceName": "Keep track of travel schedules"}], "categoryName": "Tracking"}, {"services": [{"serviceName": "Remind about doctor's/medical appointment"}, {"serviceName": "Remind to call/text/email someone"}, {"serviceName": "Remind about a meeting"}, {"serviceName": "Remind about a to-do item"}, {"serviceName": "Remind to take medication"}, {"serviceName": "Remind to avoid some food/drink"}, {"serviceName": "Remind about a calendar event"}], "categoryName": "Set a reminder"}, {"services": [{"serviceName": "Adjust heating/cooling"}, {"serviceName": "Start/stop music"}, {"serviceName": "Turn on/off the oven"}, {"serviceName": "Open/close garage door"}, {"serviceName": "Turn on/off the light"}], "categoryName": "Smart home services"}, {"services": [{"serviceName": "Search for health/disease/medical condition related information"}, {"serviceName": "Search for the nearest hospital/pharmacy"}, {"serviceName": "Search for the nearest restaurant/library"}, {"serviceName": "Search for food recipe"}, {"serviceName": "Search for song/artist/lyric"}, {"serviceName": "Search contact information for a store/restaurant/office"}, {"serviceName": "Search for promo code/discount offer for some product/service"}, {"serviceName": "Search for job opportunities"}, {"serviceName": "Search for travel info (flights/hotels/rental cars)"}, {"serviceName": "Search for weather information at a location"}, {"serviceName": "Search for meanings of a word/term/phrase"}], "categoryName": "Search for information"}, {"services": [{"serviceName": "Recommend a restaurant/food delivery store"}, {"serviceName": "Suggest a gift store/item"}, {"serviceName": "Recommend music, movie, or other media"}, {"serviceName": "Recommend medication and place to find it"}, {"serviceName": "Recommend activities/happenings nearby"}, {"serviceName": "Recommend dietary plan"}, {"serviceName": "Recommend the optimal route for a destination"}], "categoryName": "Recommend product/service"}, {"services": [{"serviceName": "Make doctor's/medical appointment"}, {"serviceName": "Schedule a meeting with a colleague"}, {"serviceName": "Schedule a get together with friends/family"}, {"serviceName": "Schedule personal care appointment (hair, nails, spa, etc.)"}], "categoryName": "Add calendar event"}, {"services": [{"serviceName": "Order food"}, {"serviceName": "Order gift item"}, {"serviceName": "Book flight/hotel/rent car"}, {"serviceName": "Buy clothes"}, {"serviceName": "Buy book"}, {"serviceName": "Order a taxi/ride share"}], "categoryName": "Purchase a product/service"}]