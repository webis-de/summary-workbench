from flask_restful import Resource

class Res(Resource):
    def get(self):
        return {"Hello": "World"}
