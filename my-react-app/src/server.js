// server.js

const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000; // Port for the backend server

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

// Amadeus API credentials
const API_KEY = process.env.AMADEUS_API_KEY;
const API_SECRET = process.env.AMADEUS_API_SECRET;
const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";

// Token storage
let accessToken = null;
let tokenExpiryTime = 0; // Unix timestamp for expiration

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
    rankPreference: SearchNearbyRankPreference.POPULARITY
  }
}

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

      const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/airports', {
        headers: { Authorization: `Bearer ${token}` },
        params: { latitude, longitude, radius: 300, }
      });

      console.log('Amadeus API response:', response.data);
  
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
        const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});