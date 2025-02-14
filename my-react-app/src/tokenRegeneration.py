import json
#import requests
import secrets
import amadeus

from amadeus import Client, Location, ResponseError

amadeus = Client(
    client_id = 'yIxeaanzEyluA4jiiCCWcNPseBAVEiuY',
    client_secret = 'PJOmYj0XylkPf0A3'
)

try:
    response =  amadeus.reference_data.locations.get(
        keyword='LON',
        subType=Location.AIRPORT
    )
    print(json.loads(response.data))
except ResponseError as error:
    print(error)