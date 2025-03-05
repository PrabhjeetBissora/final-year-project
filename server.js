// server.js

const fs = require("fs");
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080; // Port for the backend server
const SERVER_HOST = "127.0.0.1"; //   the backend server address/url


// Middleware
//app.use(cors());
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',  // Frontend URL
    methods: 'GET, POST',
    allowedHeaders: 'Content-Type, Authorization'
  }));

require('dotenv').config();
//const axios = require('axios');

var mongo = require('mongodb');

// Read env variables for credentials
const APP_SERVER_HOME = process.env.APP_SERVER_HOME;
const API_KEY = process.env.AMADEUS_API_KEY;
const API_SECRET = process.env.AMADEUS_API_SECRET;
const TOKEN_URL = process.env.TOKEN_URL;

// Token storage
let accessToken = null;
let tokenExpiryTime = 0; // Unix timestamp for expiration

/*
const getNearestAirport = (latitude, longitude) => {
  let center = new google.maps.LatLng(latitude, longitude);
  const request = {
    fields: ["displayName"],
    locationRestriction: {
      center: center,
      radius: 5000,
    },
    includedTypes: ["international_airport"],
    excludedTypes: ["taxi_stand", "car_rental"],
    max_result_count: 1,
    rankPreference: SearchNearbyRankPreference.POPULARITY
  }
}
  */

// Function to get access token
const getAccessToken = async (forceRefresh = false) => {
    if (accessToken && Date.now() < tokenExpiryTime && !forceRefresh) {
      return accessToken;
    }
  
    try {
      const response = await axios.post(TOKEN_URL, new URLSearchParams({
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": API_SECRET
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
  
      accessToken = response.data.access_token;

      console.log("Generated Access Token:", accessToken)

      tokenExpiryTime = Date.now() + (response.data.expires_in * 1000) - 5000;
      return accessToken;
    } catch (error) {
      console.error("Failed to obtain access token:", error.response.data);
      throw new Error("Failed to obtain access token.");
    }
};  

app.get('/', async (req, res) => {
 
    res.json("App server is running.");
  
 });

app.get('/api/google', async (req, res) => {
  try{
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    res.json({GOOGLE_MAPS_API_KEY});
  } catch(error) {
    console.log("ERROR WHEN TRYING TO FETCH GOOGLE MAPS API: ", error);
  }
});

// Endpoint to get Amadeus token
app.get('/api/token', async (req, res) => {
    try {
        const token = await getAccessToken();
        console.log("Generated token:", token)
        res.json({ token });
    } catch (error) {
        console.error("Error in /api/token:", error.message);
        res.status(500).json({ error: "Failed to get token" });
    }
});

app.get('/api/nearest-airports', async (req, res) => {
    const { latitude, longitude } = req.query;
    console.log(`Received request for coordinates: ${latitude}, ${longitude}`);
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }
  
    try {
      const token = await getAccessToken();

      console.log("Generated Token:", token);

      console.log('Making API request with params:', {
        latitude: latitude,
        longitude: longitude,
        radius: 150,  // Adjust radius as needed
      });

      const response = await axios.get('https://api.amadeus.com/v1/reference-data/locations/airports', {
        headers: { Authorization: `Bearer ${token}` },
        params: { latitude, longitude, radius: 300, }
      });

      //console.log('Amadeus API response:', response.data);
  
      if (response.data && response.data.data && response.data.data.length > 0) {
        const airports = response.data.data.map(airport => ({
          name: airport.name,
          iataCode: airport.iataCode,
          latitude: airport.geoCode.latitude,
          longitude: airport.geoCode.longitude,
          distance: airport.distance.value,
          country: airport.address.countryName,
        }));
  
        return res.json({ nearestAirports: airports });
      } else {
        return res.json({ error: 'No nearby airports found.' });
      }
    } catch (error) {
      console.error("Error fetching nearest airports:", error);
      return res.status(500).json({ error: "Failed to fetch nearest airports" });
    }
});

app.get('/api/flight-data', async(req, res) => {
    const { originLocationCode, destinationLocationCode, g_departureDate, adults } = req.query;
    console.log(`Received request for airports: ${originLocationCode}, ${destinationLocationCode}, on date: ${g_departureDate}`);

    const url = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDate=${g_departureDate}&adults=1`;

    try {
      // Get token from backend
      const tokenResponse = await axios.get(`http://${APP_SERVER_HOME}/api/token`);
      //console.log("tokenResponse: ", tokenResponse);
      //const tokenData = await tokenResponse.data.token;
      const token = await tokenResponse.data.token;
      console.log("token: ", token);
      //const token = tokenData.token;
  
      //console.log("Requesting Amadeus API with Token:", token);

      const response = await axios.get(url, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const flightData = response.data.data;
      //console.log("Amadeus API Response:", data);

      fs.writeFileSync("flight-data.json", JSON.stringify(flightData, null, 4), (err) => {
        if (err) {
            console.error("❌ Error saving JSON file:", err);
        } else {
            console.log("✅ JSON file saved successfully!");
        }
      });

      return res.status(200).json(flightData);

    } catch(error) {
      console.error("Error fetching flight data:", error);
      return res.status(500).json({ error: "Failed to fetch flight data" })
    }
})

app.get('/api/locations', async (req, res) => {
    const { keyword } = req.query;
    try {
        const data = await getAirportsAndCities(keyword);
        res.json(data);
    } catch (error) {
        console.error("Error in /api/locations:", error.message);
        res.status(500).json({ error: "Failed to fetch locations" });
    }
});

const getAirportsAndCities = async (keyword) => {
    try {
        const token = await getAccessToken();
        const response = await axios.get('https://api.amadeus.com/v1/reference-data/locations', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                keyword: keyword,
                subType: "AIRPORT,CITY"
            }
        });

        if (response.status === 200) {
            console.log("Airports and Cities:", response.data);
            return response.data;
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching airports and cities:", error.response?.data || error.message);
        return null;
    }
};

app.get('/api/airport-coordinates', async (req, res) => {
  const { iataCode } = req.query;

  if (!iataCode) {
      return res.status(400).json({ error: "IATA code is required" });
  }

  try {
      const token = await getAccessToken(); // Get Amadeus API token

      const response = await axios.get('https://api.amadeus.com/v1/reference-data/locations', {
          headers: { Authorization: `Bearer ${token}` },
          params: { keyword: iataCode, subType: "AIRPORT" }
      });

      if (response.data && response.data.data.length > 0) {
          const airport = response.data.data[0]; // First matching airport
          return res.json({
              name: airport.name,
              iataCode: airport.iataCode,
              latitude: airport.geoCode.latitude,
              longitude: airport.geoCode.longitude,
              country: airport.address.countryName,
          });
      } else {
          return res.status(404).json({ error: "Airport not found" });
      }
  } catch (error) {
      console.error("Error fetching airport data:", error);
      return res.status(500).json({ error: "Failed to fetch airport data" });
  }
});

/*
// Code  for mongoose config in backend
// Filename - backend/index.js

const MONGO_DB_USER = process.env.MONGO_DB_USER
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
const MONGO_DB_SERVER_URL = process.env.MONGO_DB_SERVER_URL
//const mongo_db_uri = `mongodb+srv://{$MONGO_DB_USER}:{$MONGO_DB_PASSWORD}@{$MONGO_DB_SERVER_URL}`

//const uri = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_DB_SERVER_URL}`
//MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.tdm0q.mongodb.net/sample_mflix?retryWrites=true&w=majority
const uri = `mongodb+srv://admin:tfbIfB4Lha5OItj7@fyp-cluster.4q0pr.mongodb.net/?retryWrites=true&w=majority&appName=fyp-cluster`

import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db("sample_mflix");
        const movies = await db
            .collection("movies")
            .find({})
            .sort({ metacritic: -1 })
            .limit(10)
            .toArray();
        res.json(movies);
    } catch (e) {
        console.error(e);
    }
}

// To connect with your mongoDB database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'yourDB-name',
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => err ? console.log(err) : 
    console.log('Connected to yourDB-name database'));

// Schema for users of app
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const User = mongoose.model('users', UserSchema);
User.createIndexes();

// For backend and express
//const express = require('express');
//const app = express();
const cors = require("cors");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => {

    resp.send("App server is Working");
    // You can check backend is working or not by 
    // entering http://loacalhost:5000
    
    // If you see App is working means
    // backend working properly
});

app.post("/register", async (req, resp) => {
    try {
        const user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        if (result) {
            delete result.password;
            resp.send(req.body);
            console.log(result);
        } else {
            console.log("User already register");
        }

    } catch (e) {
        resp.send("Something Went Wrong");
    }
});
*/

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      required: true,
      unique: true,
  },
});
const User = mongoose.model('users', UserSchema);

const {MongoClient} = require("mongodb");
const MONGO_DB_USER = process.env.MONGO_DB_USER
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
const MONGO_DB_SERVER_URL = process.env.MONGO_DB_SERVER_URL
const uri = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_DB_SERVER_URL}`

console.log("URI = ", uri)

const client = new MongoClient(uri);

async function listDatabases(client){
    const databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function main(){
  try{ 

      await client.connect();

      await listDatabases(client);

      /*
      const newUser = {
          name: "John Doe",
          email: "johndoe@example.com",
          password: "pass123",
          phone: "+123456789",
          address: {
              street: "123 Main St",
              city: "New York",
              zip: "10001"
          },
          createdAt: new Date(),
          orders: []
      };
      */
      const db = client.db("user-flight-journies"); // Select the database
      const usersCollection = db.collection("users"); // Select the collection

      //const result = await usersCollection.insertOne(newUser);
      

      //console.log("Customer inserted with ID: ", result.insertedId);

      console.log("Before SELECT ALL");
      res = await usersCollection.find();
      console.log("After SELECT ALL:", res);

      //await createCollection();

  } catch (error) {
      console.log("Error in MongoDB script: ", error);
  } finally{
      await client.close();
  }
}

//main();

//app.post()

app.post("/register", async (req, resp) => {
  console.log("IN REGISTER")
  try {
      console.log("IN TRY BLOCK");
      
      await client.connect();

      const db = client.db("user-flight-journies"); // Select the database
      const usersCollection = db.collection("users"); // Select the collection
      //const user = new User(req.body);
      const result = req.body;
      //let result = await user.save();
      //result = result.toObject();
      //result = user.toObject();
      if (result) {
          const response = await usersCollection.insertOne(result);
          delete result.password;
          resp.send(req.body);
          console.log(result, response);
      } else {
        console.log("User already register");
      }

  } catch (e) {
      resp.send("Something Went Wrong");
      console.log("ERROR:", e)
  }
});

app.get("/login", async (req, resp) => {
  console.log("IN LOGIN")
  try {
      console.log("IN TRY BLOCK");
      
      await client.connect();

      const db = client.db("user-flight-journies"); // Select the database
      const usersCollection = db.collection("users"); // Select the collection
      //const user = new User(req.body);
      const result = req.query;
      const { email, password } = req.query;
      //let result = await user.save();
      //result = result.toObject();
      //result = user.toObject();
      if (!email || !password) {
        return resp.status(400).json({ error: "Email and password are required" });
      }

      const response = await usersCollection.findOne({"email": result.email, "password": result.password})

      if (response) {
          //const response = await usersCollection.insertOne(result);
          //const response = await usersCollection.findOne({"email": result.email, "password": result.password})
          delete result.password;
          resp.send(true);
          console.log(result, response);
      } else {
        resp.send(false);
      }

  } catch (e) {
      resp.send("Something Went Wrong");
      console.log("ERROR:", e)
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER_HOST}:${PORT}`);
});