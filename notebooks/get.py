import pprint

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from collections import defaultdict
import json

COLLECTION = "logs"
KEY_FILE = "key.json"


def main():
    # Use a service account
    cred = credentials.Certificate(KEY_FILE)
    firebase_admin.initialize_app(cred)

    db = firestore.client()
    collection = db.collection(COLLECTION)
    docs = collection.stream()

    data=defaultdict(list)

    for doc in docs:
        ##pprint.pprint(doc.to_dict())
        doc = doc.to_dict()
        data[doc['key']].append(doc)

    for key in data:
    	with open(key+'.json', 'w') as f:
    		json.dump(data[key], f)



if __name__ == "__main__":
    main()