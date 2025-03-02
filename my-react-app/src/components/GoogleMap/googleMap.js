import React, { useEffect, useState } from "react";
// import { useRef } from "react";
import axios from 'axios';
import haversine from 'haversine-distance'

console.log("----------------------IN GOOGLEMAP.JS --------------------------------");

// import fs from 'fs';
//const fs = require("fs");

const SearchForm = ({ onSearch }) => {

console.log("----------------------IN SEARCHJ FOIRM --------------------------------");

  const [startPoint, setSP] = useState("");
  const [endPoint, setEP] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    //onSearch(startPoint, endPoint);
    onSearch("Lucan, Ireland", "Eiffel Tower, Paris");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
      <label>
        Start point:
        <input
          type="text"
          value={startPoint}
          onChange={(e) => setSP(e.target.value)}
        />
      </label>
      <label>
        End point:
        <input
          type="text"
          value={endPoint}
          onChange={(e) => setEP(e.target.value)}
        />
      </label>
      <button type="submit">Search</button>
    </form>
  );
};

const GoogleMap = ({ onLogout }) => {

console.log("----------------------IN GOOGL,E MAP COMPONENT --------------------------------");

  const [map, setMap] = useState(null);
  const [directionsRenderer1, setDirectionsRenderer1] = useState(null);
  const [directionsRenderer2, setDirectionsRenderer2] = useState(null);
  const [groundDetailsStart, setGroundDetailsStart] = useState({});
  const [groundDetailsEnd, setGroundDetailsEnd] = useState({});
  const [flightDetails, setFlightDetails] = useState({});
  const [totalDistance, setTotalDistance] = useState({});
  const [carrierCode, setCarrierCode] = useState({});
  const [destDetails, setDestDetails] = useState({});
  const [destTemp, setDestTemp] = useState({});
  const [directionsResult, setDirectionsResult] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [airportDetails, setAirportDetails] = useState({});

  // only load 1 times
  // const scriptLoaded = useRef(false);

  useEffect(() => {
    //if (scriptLoaded.current) return; // Skip if script is already loaded
    //scriptLoaded.current = true;

    console.log("Google Maps -useEffect");
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBoPryoNFGz_SvBneuhkfgIcMI381f88fQ&callback=initMap";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        initMap();
      } else {
        console.error("Google Maps API failed to load.");
      }
    };

    /*
    if (groundDetailsStart.duration && groundDetailsEnd.duration && flightDetails.duration){
      totalDuration(
        { distance: groundDetailsStart.distance, duration: groundDetailsStart.duration },
        { distance: groundDetailsEnd.distance, duration: groundDetailsEnd.duration },
        { distance: flightDetails.distance, duration: flightDetails.duration }
      );
    }
    */

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  //[groundDetailsStart, groundDetailsEnd, flightDetails]);

  // if all three variables set, call totalDuration()
  useEffect(() => {
    if (groundDetailsStart.duration && groundDetailsEnd.duration && flightDetails.duration){
      totalDuration(
        { distance: groundDetailsStart.distance, duration: groundDetailsStart.duration },
        { distance: groundDetailsEnd.distance, duration: groundDetailsEnd.duration },
        { distance: flightDetails.distance, duration: flightDetails.duration }
      );
    }
  }, [groundDetailsStart, groundDetailsEnd, flightDetails])

  /*
  // output when startduration updates
  useEffect(() => {
    console.log("Updated startDistance=", groundDetailsStart.distance);
    console.log("Updated startDuration=", groundDetailsStart.duration);
  }, [groundDetailsStart]);
  */

  // rerender direction renderer
  /*
  useEffect(() => {
    console.log("----------------------IN RERENDERING RENDER --------------------------------");
    if (!directionsRenderer) {
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
    }
  }, []);
  */

  /*
  // rerender direction route
  useEffect(() => {
    console.log("----------------------IN RERENDERING ROUTE --------------------------------");
    if (directionsResult && directionsRenderer) {
      directionsRenderer.setDirections(directionsResult);
    }
  }, [directionsResult, directionsRenderer]);
  */

  const displayJourneyDetails = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Journey</th>
            <th>Distance</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ground (Start to {airportDetails.startAirport} Airport)</td>
            <td>{groundDetailsStart.distance}</td>
            <td>{groundDetailsStart.duration}</td>
          </tr>
          <tr>
            <td>Flight operated by Airline: {carrierCode.airlineCode}</td>
            <td>{flightDetails.distance}</td>
            <td>{flightDetails.duration}</td>
          </tr>
          <tr>
            <td>Ground ({airportDetails.endAirport} Airport to End)</td>
            <td>{groundDetailsEnd.distance}</td>
            <td>{groundDetailsEnd.duration}</td>
          </tr>
          <tr>
            <td>Total Duration</td>
            <td colSpan="2">{totalDistance.distance}</td>
          </tr>
          <tr>
            <td>Temperature of endpoint</td>
            <td>{destTemp.min}</td>
            <td>{destTemp.max}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  /*
  const airportCoords = {
    DUB: { lat: 53.4256, lng: -6.2574 }, // Dublin Airport
    LHR: { lat: 51.468, lng: -0.4551 }, // London Heathrow
    JFK: { lat: 40.6413, lng: -73.7781 }, // JFK
    LAX: { lat: 33.9416, lng: -118.4085 }, // LAX
    ORK: { lat: 51.8413, lng: -8.4911 }, // Cork Airport
    AMS: { lat: 52.3105, lng: 4.7683 }, // Amsterdam Schiphol Airport
    BRU: { lat: 50.9010, lng: 4.4844 }, // Amsterdam Schiphol Airport
  };
  */
  
  //const getAirportCoords = (iataCode) => airportCoords[iataCode] || null;

  const displayFlightsOnMap = (flightData) => {
    if (!map) {
      console.error("Map is not initialized yet.");
      return;
    }

    if (!flightData.itineraries || !flightData.itineraries[0].segments) {
      console.error("Flight data structure is incorrect:", flightData);
      return;
    }

    //flights = flightData.itineraries.segments;

    console.log("Segments: ", flightData.itineraries[0].segments);

    flightData.itineraries[0].segments.forEach((flight) => {

      console.log("Flight: ", flight);

      const origin = flight.departure.iataCode;
      const destination = flight.arrival.iataCode;

      /*
      const originCoords = airportCoords[origin];
      const destinationCoords = airportCoords[destination];

      if (!originCoords || !destinationCoords) {
        console.error(`Coordinates not found for ${origin} or ${destination}`);
        return;
      }
      

      // Draw flight path
      new window.google.maps.Polyline({
        path: [originCoords, destinationCoords],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map,
      });

      */

    });

    /*
    flights.forEach((flight) => {
      const origin = flight.itineraries[0].segments[0].departure.iataCode;
      const destination = flight.itineraries[0].segments.slice(-1)[0].arrival.iataCode;

      const originCoords = getAirportCoords(origin);
      const destinationCoords = getAirportCoords(destination);

      if (!originCoords || !destinationCoords) {
        console.error(`Coordinates not found for ${origin} or ${destination}`);
        return;
      }

      new window.google.maps.Polyline({
        path: [originCoords, destinationCoords],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map,
      });
    });
    */
  };

  const initMap = () => {

    console.log("----------------------IN INIT MAP --------------------------------");

    const googleMap = new window.google.maps.Map(
      document.getElementById("map"),
      {
        center: { lat: 53.4256, lng: -6.2574 }, // Default to Dublin
        zoom: 5,
      }
    );
    setMap(googleMap);

    setDirectionsRenderer1(new window.google.maps.DirectionsRenderer({ map: googleMap }));
    setDirectionsRenderer2(new window.google.maps.DirectionsRenderer({ map: googleMap }));
  };

  const findNearestAirport = async (location) => {

    console.log("----------------------IN FINDING NEAREST AIRPORT --------------------------------");

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve) =>
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK") resolve(results[0].geometry.location);
        else resolve(null);
      })
    );
  
    if (!response) {
      console.error(`Geocoding failed for location: ${location}`);
      alert("Failed to get location coordinates.");
      return null;
    }
  
    var latitude = response.lat();
    var longitude = response.lng();
  
    // Log geocoded coordinates
    //console.log(`Geocoded location ${location} to latitude: ${latitude}, longitude: ${longitude}`);
  
    try {
      const nearestAirport = await getNearestAirport(latitude, longitude);
      console.log("nearestAirport:" , nearestAirport);
      console.log("latitude:" , latitude);
      console.log("longitude:" , longitude);
      //const destTemperature = async (latitude, longitude, departureDate) => {
      console.log("g_departureDate value is: " , g_departureDate);
      let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${g_departureDate}&end_date=${g_departureDate}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

      console.log("url value is: " , url);

      fetch(url)
        .then(response => {

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
        })

        .then(data => {
          console.log("Weather Data:", data); // Output the API response to the console

          // Extract temperature values
          let maxTemp = data.daily.temperature_2m_max[0];
          let minTemp = data.daily.temperature_2m_min[0];

          console.log(`Max Temp: ${maxTemp}°C`);
          console.log(`Min Temp: ${minTemp}°C`);

          setDestTemp({
            max: maxTemp,
            min: minTemp
          })
        })
        .catch(error => console.error("Error fetching data:", error));
      

      //}
      if (nearestAirport) {
        console.log(`Nearest airport found: ${nearestAirport.iataCode}`);
        return {
          code: nearestAirport.iataCode,
          coords: {
            lat: nearestAirport.latitude,
            lng: nearestAirport.longitude
          }
        };
      } else {
        console.error(`No airport found for coordinates: ${latitude}, ${longitude}`);
      }
    } catch (error) {
      console.error("Error getting nearest airport:", error);
    }
  
    return null;
  };
  
  const getNearestAirport = async (latitude, longitude) => {

    console.log("----------------------IN GETTING NEAREST AIRPORT --------------------------------");

    try {
      const response = await axios.get('http://localhost:5000/api/nearest-airports', {
        params: {
          latitude,
          longitude,
        },
      });

      if (response.data.nearestAirports) {
        console.log(response.data.nearestAirports);
      } else {
        alert('No nearby airports found.');
      }

      return response.data.nearestAirports[0];
    } catch (err) {
      console.error('Error fetching nearest airports:', err);
      alert('Failed to fetch nearest airports.');
    }
  };  

  const calculateRoute = async (directionsService, directionsRenderer, start, end, setDetails) => {

    console.log("----------------------IN CALCULATE ROUTE --------------------------------");

  //const calculateRoute = async (directionsService, directionsRenderer, start, end) => {
    return new Promise((resolve, reject) => {
      if (!start || !end) {
        alert("Please enter valid locations.");
        return;
      }

      const request = {
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.TRANSIT,
      };

      //setTimeout(() => {

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // console.log("Transit request: ", result)

          setDirectionsResult(result); // Store the result in state
          setDirectionsRenderer(directionsRenderer);

          directionsRenderer.setDirections(result);

          const leg = result.routes[0].legs[0]; // Extract first leg of journey

          // console.log("TRANSIT RESULT: ", result);
          console.log("LEG: ", leg);

          setDetails({
            distance: leg.distance.text, // Example: "15 km"
            duration: leg.duration.text, // Example: "30 mins"
          });
          
          resolve({ distance: leg.distance.text, duration: leg.duration.text });

        } else {
          alert("Directions request failed: " + status);
        }
      });

      //}, 10000);
    })
  };

  var g_departureDate = "2025-03-07";
  
  const fetchFlightData = async (originLocationCode, destinationLocationCode, retry = true) => {
    
    console.log("----------------------IN FETCH FLIGHT DATA --------------------------------");

    
    //const departureDate = new Date().toISOString().slice(0, 10); // ref: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
    //const url = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1`;


    try {
      // console.log("iNSIDE TRY BLOCK:");
      // console.log(" try g_departureDate:", g_departureDate);
      // console.log("originLocationCode:", originLocationCode);
      // console.log("destinationLocationCode:", destinationLocationCode);
      // console.log("before get call ");
      const response = await axios.get('http://localhost:5000/api/flight-data', {
        params: { g_departureDate,
          originLocationCode,
          destinationLocationCode },
      });

      // console.log("after get call ");
      console.log("2response.data:", response.data);
      if (response.data) {
        //displayFlightsOnMap(response.data[0]);

        const cheapestFlight = response.data.reduce((prev, curr) => 
          parseFloat(curr.price.grandTotal) < parseFloat(prev.price.grandTotal) ? curr : prev
        );

        console.log("Cheapest Flight Found:", cheapestFlight);

        /*
        const originCoords = airportCoords[originLocationCode];
        const destinationCoords = airportCoords[destinationLocationCode];

        let flightDistance = "N/A";
        if (originCoords && destinationCoords) {
          flightDistance = (haversine(
            { lat: originCoords.lat, lon: originCoords.lng },
            { lat: destinationCoords.lat, lon: destinationCoords.lng }
          )).toFixed(2) + " km"; // Convert meters to km
        }
          */

        console.log(response.data[0]);
        console.log("setFlightDetails duration=", response.data[0].itineraries[0].duration.replace("PT", ""));

        setFlightDetails({
          distance: "N/A", // Flight API might not provide exact distance
          //distance: flightDistance,
          duration: response.data[0].itineraries[0].duration.replace("PT", ""),
          
          //price: `${cheapestFlight.price.currency} ${cheapestFlight.price.grandTotal}`,
        });

        console.log("STARTING AIRPORT CODE:", response.data[0].itineraries[0].segments[0].departure.iataCode)
        console.log("ENDING AIRPORT CODE:", response.data[0].itineraries[0].segments[0].arrival.iataCode)

        setAirportDetails({
          startAirport: response.data[0].itineraries[0].segments[0].departure.iataCode,
          endAirport: response.data[0].itineraries[0].segments[0].arrival.iataCode,
        });

        // console.log("groundDetailsStart=", groundDetailsStart);
        // console.log("groundDetailsStart.duration=", groundDetailsStart.duration);
        // console.log("groundDetailsEnd.duration=", groundDetailsEnd.duration);
        // console.log("flightDetails.duration=", flightDetails.duration);
    
        setCarrierCode({
          airlineCode: response.data[0].itineraries[0].segments[0].carrierCode,
        });


        console.log("response.data[0].itineraries[0].duration : ", response.data[0].itineraries[0].duration.replace("PT", ""));
        const newDuration = timeConversionToMinutes(response.data[0].itineraries[0].duration.replace("PT", ""))
        console.log("newDuration = ", newDuration);

        displayFlightsOnMap(response.data[0]);

        /*
        const jsonData = JSON.stringify(response.data[0], null, 4);
        fs.writeFile("flight-data.json", jsonData, (err) => {
          if (err) {
              console.error("❌ Error saving JSON file:", err);
          } else {
              console.log("✅ JSON file saved successfully!");
          }
        });
        */

        //totalDuration();
        
      } else {
        alert('No flight data found found.');
      }


    } catch (error){
      console.log("iNSIDE catch  BLOCK:");
      console.error('Error fetching flight data:', error);
      alert('Failed to fetch flight data.');
    }

    /*
    try {
      // Get token from backend
      const tokenResponse = await fetch('http://localhost:5000/api/token');
      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
  
      console.log("Requesting Amadeus API with Token:", token);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Amadeus API Response:", data);
  
      // Check if the token was invalid and retry once with a fresh token
      if (data.errors && retry) {
        console.warn("Token might be expired, retrying with a new token...");
        return fetchFlightData(origin, destination, false);
      }
  
      if (!data.data || data.data.length === 0) {
        alert("No flights found!");
        return;
      }
  
      const flight = data.data[0];
      const distance = flight.itineraries[0]?.distance?.replace("PT", "").toLowerCase();
      const duration = flight.itineraries[0]?.duration?.replace("PT", "").toLowerCase();

      //console.log(flight.itineraries);
  
      setFlightDetails({
        distance: distance,
        duration: duration,
      });
  
      displayFlightsOnMap(data.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
      */
  };  

  const timeConversionToMinutes = async (duration) => {

    // console.log("----------------------IN TIME CONVERSION --------------------------------");


    // console.log("duration=", duration);
    let hours = duration.match(/(\d+)\s*(H|hour|hours)/i);
    let minutes = duration.match(/(\d+)\s*(M|min|mins)/i);
    // console.log("hours=", hours);
    // console.log("minutes=", minutes);
    let parsedHours = hours ? parseInt(hours[1]): 0;
    let parsedMinutes = minutes ? parseInt(minutes[1]): 0;

    return ((parsedHours * 60) + parsedMinutes);
  }

  async function totalDuration(startDetails, endDetails, flightDetails) {

    console.log("----------------------IN TOTAL DURATION --------------------------------");

    console.log("startDetails=", startDetails);
     console.log("groundDetailsStart.duration=", startDetails.duration);
    // console.log("groundDetailsEnd.duration=", endDetails.duration);
    // console.log("flightDetails.duration=", flightDetails.duration);
    let startDuration = await timeConversionToMinutes(startDetails.duration);
    let endDuration = await timeConversionToMinutes(endDetails.duration);
    let flightDuration = await timeConversionToMinutes(flightDetails.duration);

    //console.log("groundDetailsStart.duration=", startDetails.duration);
    //console.log("groundDetailsEnd.duration=", endDetails.duration);
    //console.log("flightDetails.duration=", flightDetails.duration);

    let totalJourneyDurationM = startDuration + endDuration + flightDuration;

    let hours = Math.floor(totalJourneyDurationM / 60) + " hours "; // divide by 60 then use floor() to get num of hours
    let mins = (totalJourneyDurationM % 60) + " mins";

    let totalJourneyDurationHM = hours + mins;

    console.log("totalJourneyDuration = ",totalJourneyDurationHM);

    setTotalDistance({
      distance: totalJourneyDurationHM
    });
  }

  const handleSearch = async (startPoint, endPoint) => {

    console.log("----------------------IN HANDLE SEARCH --------------------------------");

    if (!startPoint || !endPoint) {
      alert("Please enter valid start and end locations.");
      return;
    }

    /*
    axios.get(`http://localhost:5000/api/nearest-airports?latitude=53.381194&longitude=-6.592497`)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
    */
  
    //console.log(`Searching for nearest airports for start point: ${startPoint} and end point: ${endPoint}`);
  
    // Get nearest airports for both start and end points
    const startAirport = await findNearestAirport(startPoint);
    const endAirport = await findNearestAirport(endPoint);
  
    if (!startAirport || !endAirport) {
      alert("Could not find nearest airports.");
      return;
    }
  
    console.log("Start Airport:", startAirport.code);
    console.log("End Airport:", endAirport.code);
  
    const directionsService1 = new window.google.maps.DirectionsService();
    const directionsService2 = new window.google.maps.DirectionsService();
  
    // Route 1: Start Point -> Nearest Airport

    console.log("BEFORE groundDetailsStart=", groundDetailsStart);
    console.log("groundDetailsStart.duration=", groundDetailsStart.duration);
    console.log("groundDetailsEnd.duration=", groundDetailsEnd.duration);
    console.log("flightDetails.duration=", flightDetails.duration);

    console.log("BEFORE startPoint=", startPoint);
    console.log("BEFORE airport=", startAirport.code);

    /*
    let startDistance, startDuration = await calculateRoute(
      directionsService1,
      directionsRenderer1,
      startPoint,
      `${startAirport.code} Airport`
      //setGroundDetailsStart
    );
    */

    await calculateRoute(
      directionsService1,
      directionsRenderer1,
      startPoint,
      `${startAirport.code} Airport`,
      setGroundDetailsStart
    );

    console.log("AFTER startDistance=", groundDetailsStart.distance);
    console.log("AFTER startDuration=", groundDetailsStart.duration);

    /*
    setGroundDetailsStart({
      distance: startDistance,
      duration: startDuration
    })
      */
  
    console.log("BEFORE groundDetailsEnd=", groundDetailsEnd);
    console.log("groundDetailsStart.duration=", groundDetailsStart.duration);
    console.log("groundDetailsEnd.duration=", groundDetailsEnd.duration);
    console.log("flightDetails.duration=", flightDetails.duration);

    await calculateRoute(
      directionsService2,
      directionsRenderer2,
      `${endAirport.code} Airport`,
      endPoint,
      setGroundDetailsEnd
    );

    console.log("AFTER endDistance=", groundDetailsEnd.distance);
    console.log("AFTER endDuration=", groundDetailsEnd.duration);

    /*
    // Route 2: Nearest Airport -> End Point
    let endDistance, endDuration = await calculateRoute(
      directionsService2,
      directionsRenderer2,
      `${endAirport.code} Airport`,
      endPoint
      //setGroundDetailsEnd
    );

    setGroundDetailsEnd({
      distance: endDistance,
      duration: endDuration
    })
      */
  
    // Fetch flight data from Amadeus API
    await fetchFlightData(startAirport.code, endAirport.code, setFlightDetails);
    // await totalDuration();
    //destTemperature(longitude, latitude, departureDate);
  };

  return (
    <div>
      <h1>Flight Journey Planner</h1>
      <SearchForm onSearch={handleSearch} />
      <div id="map" style={{ height: "600px", width: "100%" }}></div>
      <div>
        <h2>Journey Details</h2>
        {displayJourneyDetails()}
      </div>
    </div>
  );
};

export default GoogleMap;
