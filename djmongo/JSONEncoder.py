import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            print("object_id is ",o)
            return str(o)
        return json.JSONEncoder.default(self, o)

