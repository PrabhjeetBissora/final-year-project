import React, { useEffect, useState } from "react";
// import { useRef } from "react";
import axios from 'axios';
import haversine from 'haversine-distance'
import { useNavigate } from "react-router-dom";
import styles from "./googleMap.css"

//require('dotenv').config();

console.log("----------------------IN GOOGLEMAP.JS --------------------------------");

var config  = require('./myConfigVars.json');
var x = config.GOOGLE_MAPS_API_KEY;
//console.log("TEST URL GOOGLE_MAPS_API_KEY " + x)
//var BACKEND_PORT = config.BACKEND_PORT;
var APP_SERVER_HOME = config.APP_SERVER_HOME;

//console.log("TEST URL BACKEND_PORT " + BACKEND_PORT)

/*
const {INIT_CWD} = process.env; // process.env.INIT_CWD 
const paths = require(${INIT_CWD}/config/paths);
console.log("PWD:" ,process.env.PWD)
*/

// import fs from 'fs';
//const fs = require("fs");

const SearchForm = ({ onSearch }) => {

console.log("----------------------IN SEARCH FORM --------------------------------");

  const [startPoint, setSP] = useState("");
  const [endPoint, setEP] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [userPreference, setUserPreference] = useState("");
  const [deptDate, setDeptDate] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    let start_point = document.querySelector('input[name="input_start_point"]').value;
    let end_point = document.querySelector('input[name="input_end_point"]').value;
    let dept_date = document.querySelector('input[name="input_departure_date"]').value;
    e.preventDefault();
    //onSearch(start_point, end_point, dept_date, "from_find_nearest_airports");
    onSearch(startPoint, endPoint, dept_date, "from_find_nearest_airports");
    //onSearch("Lucan, Ireland", "Eiffel Tower, Paris", deptDate);
  };

  return (
    <div className="googleMap">
      <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <label>
          Start point:
          <input
            name="input_start_point"
            type="text"
            //value="dublin"
            value={startPoint}
            placeholder="Enter start location"
            onChange={(e) => setSP(e.target.value)}
          />
        </label>
        <label>
          End point:
          <input
            name="input_end_point"
            type="text"
            //value="paris"
            value={endPoint}
            placeholder="Enter end location"
            onChange={(e) => setEP(e.target.value)}
          />
        </label>
        <label>
          Date of departure:
          <input
            name="input_departure_date"
            type="date"
            value="2025-04-04"
            min={new Date().toISOString().split("T")[0]} // don't allow inputs before today's date
            onChange={(e) => setDeptDate(e.target.value)}
          />
        </label>
        <p>Select your transport mode:</p>
        <input 
          type="radio" 
          id="driving" 
          name="transport_mode" 
          value="driving" 
          checked="checked"
          onChange={(e) => setTransportMode(e.target.value)}
          />
        <label for="driving">Driving</label>
        <input 
          type="radio" 
          id="transit" 
          name="transport_mode" 
          value="transit"
          onChange={(e) => setTransportMode(e.target.value)}
          />
        <label for="transit">Transit</label><br></br>


        <p>Select your preference:</p>
        <input 
          type="radio" 
          id="cheapest" 
          name="user_preference" 
          value="cheapest" 
          checked="checked"
          onChange={(e) => setUserPreference(e.target.value)}
          />
        <label for="cheapest">Cheapest</label>
        <input 
          type="radio" 
          id="fastest" 
          name="user_preference" 
          value="fastest"
          onChange={(e) => setUserPreference(e.target.value)}
          />
        <label for="fastest">Fastest</label><br></br>
        <br></br>  
        <button type="submit">Find Nearest Airports</button>
      </form>
    </div>
  );
};

const GoogleMap = ({ onLogout }) => {

console.log("----------------------IN GOOGLE MAP COMPONENT --------------------------------");

  const [apiKey, setApiKey] = useState({});

  const [map, setMap] = useState(null);
  const [flightPath, setFlightPath] = useState(null);
  const [directionsRenderer1, setDirectionsRenderer1] = useState(null);
  const [directionsRenderer2, setDirectionsRenderer2] = useState(null);
  const [groundDetailsStart, setGroundDetailsStart] = useState({});
  const [groundDetailsEnd, setGroundDetailsEnd] = useState({});
  //const [flightDetails, setFlightDetails] = useState({});
  const [flightDetails, setFlightDetails] = useState([null]);
  const [totalDistance, setTotalDistance] = useState({});
  const [carrierCode, setCarrierCode] = useState({});
  const [destDetails, setDestDetails] = useState({});
  const [destTemp, setDestTemp] = useState({});
  const [directionsResult, setDirectionsResult] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [airportDetails, setAirportDetails] = useState({});
  const [flights, setFlights] = useState([null]);
  const [selectedFlight, setSelectedFlight] = useState({});
  const [startAirports, setStartAirports] = useState([null]);
  const [endAirports, setEndAirports] = useState([null]);
  const [g_departureDate, setGDepartureDate] = useState("");
  const [selectedStartAirport, setSelectedStartAirport] = useState({});
  const [selectedEndAirport, setSelectedEndAirport] = useState({});
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [deptDate, setDeptDate] = useState("");
  const [showAirports, setShowAirports] = useState(false);
  const [showFlights, setShowFlights] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [flightPathCoords, setFlightPathCoords] = useState([]);

  // only load 1 times
  // const scriptLoaded = useRef(false);

  useEffect(() => {
    //if (scriptLoaded.current) return; // Skip if script is already loaded
    //scriptLoaded.current = true;

    //let API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    //console.log("API KEY =", API_KEY);

    // const fetchData = async () => {
    //   // You can await here
    //   try {
    //     const response = await axios.get(`http://localhost:${BACKEND_PORT}/api/google`);
    //     console.log("response:",response)
    //     setApiKey(response); // Assuming the server returns { apiKey: "YOUR_KEY" }
    //     return(response);
    //   } catch (error) {
    //     console.error("Error fetching API key:", error);
    //   }
    // };

    console.log("Google Maps -useEffect");
    const script = document.createElement("script");

    //const request = await axios.get('http://localhost:5000/api/google');

    /*
    let res = fetchData();
    console.log("Output of fetchdata is: ", res);
    let REACT_APP_GOOGLE_MAPS_API_KEY = apiKey;
    */

    // console.log("Google Key:", `https://maps.googleapis.com/maps/api/js?key=${REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`);
    //script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    // script.src = `https://maps.googleapis.com/maps/api/js?key=${REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${x}&callback=initMap`;

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
    //if (groundDetailsStart.duration && groundDetailsEnd.duration && flightDetails.duration && selectedFlight){
    console.log("IN USE EFFECT")
    if (groundDetailsStart.duration && groundDetailsEnd.duration && flightDetails.duration){
      totalDuration(
        { distance: groundDetailsStart.distance, duration: groundDetailsStart.duration },
        { distance: groundDetailsEnd.distance, duration: groundDetailsEnd.duration },
        //{ distance: selectedFlight.distance, duration: selectedFlight.duration }
        { distance: flightDetails.distance, duration: flightDetails.duration }
      );
      //displayItineraryDetails();
    }
  }, [groundDetailsStart, groundDetailsEnd, flightDetails])
  //}, [groundDetailsStart, groundDetailsEnd, flightDetails])

  // print when flights get updated
  useEffect(() => {
    console.log("Updated FLIGHTDATADETAILS= ", flights);
  }, [flights,]);

  // when user selects start and end airports
  // useEffect(() => {
  //   if (selectedStartAirport.iataCode && selectedEndAirport.iataCode){
  //     handleSearch(startPoint, endPoint, deptDate);
  //   }
  // }, )

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

  const addFlightDetails = (newFlight) => {
    setFlightDetails(prevFlights => Array.isArray(prevFlights) ? [...prevFlights, newFlight] : [newFlight]);
  }

  const handleSelectFlight = async (flight) => {
    console.log("Selected flight:", flight);
    /*
    setSelectedFlight({
      distance: "N/A", // Flight API might not provide exact distance
      //distance: flightDistance,
      duration: flight.itineraries[0].duration.replace("PT", "")
    })
      */

    if (flightDetails){
      setFlightDetails([]);
    }

    if (flightPath){
      flightPath.setMap(null);
    }

    setCarrierCode({
      //airlineCode: flight.itineraries[0].segments[0].carrierCode,
      airlineCode: [... new Set(flight.itineraries[0].segments.map(segment => segment.carrierCode))].join(", "),
    });

    console.log("Flight.itineraries[0].segments:", flight.itineraries[0].segments)

    await addFlightDetails(flight.itineraries[0].segments)

    await displayFlightsOnMap(flight);

    /*
    setFlightDetails({
      distance: "N/A", // Flight API might not provide exact distance
      //distance: flightDistance,
      duration: flight.itineraries[0].duration.replace("PT", ""),
      
      //price: `${cheapestFlight.price.currency} ${cheapestFlight.price.grandTotal}`,
    });
    */

    //setShowJourney(true);
    //displayItineraryDetails();

    console.log("before display journey");

    setShowJourney(true);
    /*
    return(
      <div>
        {displayItineraryDetails()}
      </div>
    );
    */
  };

  const displayItineraryDetails = () => {
    console.log("in display journey")
    console.log(flightDetails)
    return (
      <div>
        <h2>Journey Details</h2>
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
              <td>(From: {startPoint} to {airportDetails.startAirport} Airport)</td>
              <td>{groundDetailsStart.distance}</td>
              <td>{groundDetailsStart.duration}</td>
            </tr>
            {/* <tr>
              <td>Flights operated by Airlines: {carrierCode.airlineCode}</td>
              <td>{flightDetails.distance}</td>
              <td>{flightDetails.duration}</td>
            </tr> flight.itineraries[0].duration.replace("PT", "") */}
            {flightDetails[0].map((flight, index) => (
              <tr key={index}>
                <td>Flight operated by {flight.carrierCode} Airlines</td>
                <td>""</td>
                <td>{flight?.duration.replace("PT", "")}</td>
              </tr>
            ))}
            <tr>
              <td>Ground ({airportDetails.endAirport} Airport to {endPoint})</td>
              <td>{groundDetailsEnd.distance}</td>
              <td>{groundDetailsEnd.duration}</td>
            </tr>
            <tr>
              <td>Total Duration</td>
              <td colSpan="2">{totalDistance.distance}</td>
            </tr>
            <h2>Weather at destination</h2>
            <tr>
              <td>Temperature of endpoint</td>
              <td>Min: {destTemp.min}°C</td>
              <td>Max: {destTemp.max}°C</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const displayAvailableFlights = () => {

    console.log("in displayAvailableFlights");
    return(
      <div>

        <h2>Available Flights</h2>
        <table>
          <thead>
            <tr>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Duration</th>
              <th>Operated by</th>
              <th>&nbsp;&nbsp;&nbsp;Fare&nbsp;&nbsp;&nbsp;</th>
              <th>Currency</th>
              <th>Select?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{flights[0]?.FormattedDepartureTime || "N/A"}</td>
              <td>{flights[0]?.FormattedArrivalTime || "N/A"}</td>
              <td>{flights[0]?.formattedFlightDuration || "N/A"}</td>
              <td>{flights[0]?.itineraries?.[0]?.segments?.[0]?.carrierCode || "N/A"}</td>
              <td>{flights[0]?.price?.grandTotal || "N/A"}</td>
              <td>{flights[0]?.price?.currency || "N/A"}</td>
              <td><button onClick={() => handleSelectFlight(flights[0])}>Select</button></td>
            </tr>
            <tr>
              <td>{flights[1]?.FormattedDepartureTime || "N/A"}</td>
              <td>{flights[1]?.FormattedArrivalTime || "N/A"}</td>
              <td>{flights[1]?.formattedFlightDuration || "N/A"}</td>
              <td>{flights[1]?.itineraries?.[0]?.segments?.[0]?.carrierCode || "N/A"}</td>
              <td>{flights[1]?.price?.grandTotal || "N/A"}</td>
              <td>{flights[1]?.price?.currency || "N/A"}</td>
              <td><button onClick={() => handleSelectFlight(flights[1])}>Select</button></td>
            </tr>
            <tr>
              <td>{flights[2]?.FormattedDepartureTime || "N/A"}</td>
              <td>{flights[2]?.FormattedArrivalTime || "N/A"}</td>
              <td>{flights[2]?.formattedFlightDuration || "N/A"}</td>
              <td>{flights[2]?.itineraries?.[0]?.segments?.[0]?.carrierCode || "N/A"}</td>
              <td>{flights[2]?.price?.grandTotal || "N/A"}</td>
              <td>{flights[2]?.price?.currency || "N/A"}</td>
              <td><button onClick={() => handleSelectFlight(flights[2])}>Select</button></td>
            </tr>
          </tbody>
        </table>

      </div>
    );
  };

  const displayAvailableAirports = () => {
    return (
      <div className="googleMap">
        <h2>Available Airports</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nearest airport to startpoint</th>
              <th>Nearest airport to endpoint</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                {startAirports[0]?.iataCode} Airport 
                {startAirports[0] && (
                  <input
                    type="radio"
                    name="selectedStartAirport"
                    value={startAirports[0]?.id}
                    //checked={selectedFlight?.id === startAirports[0]?.id}
                    onChange={() => setSelectedStartAirport(startAirports[0])}
                  />
                )}
              </th>
              <th>
                {endAirports[0]?.iataCode} Airport
                {endAirports[0] && (
                  <input
                    type="radio"
                    name="selectedEndAirport"
                    value={endAirports[0]?.id}
                    //checked={selectedFlight?.id === endAirports[0]?.id}
                    onChange={() => setSelectedEndAirport(endAirports[0])}
                  />
                )}
              </th>
            </tr>
            <tr>
              <th>
                {startAirports[1]?.iataCode} Airport
                {startAirports[1] && (
                  <input
                    type="radio"
                    name="selectedStartAirport"
                    value={startAirports[1]?.id}
                    //checked={selectedFlight?.id === startAirports[1]?.id}
                    onChange={() => setSelectedStartAirport(startAirports[1])}
                  />
                )}
              </th>
              <th>
                {endAirports[1]?.iataCode} Airport
                {endAirports[1] && (
                  <input
                    type="radio"
                    name="selectedEndAirport"
                    value={endAirports[1]?.id}
                    //checked={selectedFlight?.id === endAirports[1]?.id}
                    onChange={() => setSelectedEndAirport(endAirports[1])}
                  />
                )}  
              </th>
            </tr>
            <tr>
              <th>
                {startAirports[2]?.iataCode} Airport
                {startAirports[2] && (
                  <input
                    type="radio"
                    name="selectedStartAirport"
                    value={startAirports[2]?.id}
                    //checked={selectedFlight?.id === startAirports[2]?.id}
                    onChange={() => setSelectedStartAirport(startAirports[2])}
                  />
                )}
              </th>
              <th>
                {endAirports[2]?.iataCode} Airport
                {endAirports[2] && (
                  <input
                    type="radio"
                    name="selectedEndAirport"
                    value={endAirports[2]?.id}
                    //checked={selectedFlight?.id === endAirports[0]?.id}
                    onChange={() => setSelectedEndAirport(endAirports[2])}
                  />
                )}  
              </th>
            </tr>
          </tbody>
        </table>
        <button onClick={() => handleSearch(startPoint, endPoint, deptDate, "from_find_flights")}>Find Flights</button>
      </div>
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
  
  const findCoordsFromAirportCode = async (airportCode) => {
    let airport = airportCode + " airport";
    console.log("AIRPORT", airport)

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve) =>
      geocoder.geocode({ address: airport }, (results, status) => {
        console.log("results[0].geometry.location:", results)
        if (status === "OK") resolve(results[0].geometry.location);
        else resolve(null);
      })
    );

    if (!response) {
      console.error(`Geocoding failed for location: ${airport}`);
      alert("Failed to get location coordinates.");
      return null;
    }
  
    var latitude = response.lat();
    var longitude = response.lng();

    return {latitude, longitude};
  }

  const findHaversine = async (startAirportCoords, endAirportCoords) => {

    //let StartAirportCoords = await findCoordsFromAirportCode(startAirportCode);
    //let endAirportCoords = await findCoordsFromAirportCode(endAirportCode);

    let flightDistance = "N/A";
    if (startAirportCoords && endAirportCoords) {
      flightDistance = (haversine(
        { lat: startAirportCoords.latitude, lon: startAirportCoords.longitude },
        { lat: endAirportCoords.latitude, lon: endAirportCoords.longitude }
      )).toFixed(2) + " km"; // Convert meters to km
    }

    return flightDistance;
  };

  const addFlightPathCoords = (newCoords) => {
    setFlightPathCoords(prevCoords => [...prevCoords, newCoords]);
  }

  const displayFlightsOnMap = async (flightData) => {

    console.log("IN displayFlightsOnMap");
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

    let firstDept = flightData.itineraries[0].segments[0].departure.iataCode;
    let firstDeptCoords = await findCoordsFromAirportCode(firstDept);

    // addFlightPathCoords({
    //   lat : firstDeptCoords.latitude, 
    //   lng : firstDeptCoords.longitude
    // });

    let flightPathCoords = [];

    flightPathCoords.push({
      lat: firstDeptCoords.latitude, 
      lng: firstDeptCoords.longitude
    });

    //flightData.itineraries[0].segments.forEach(async (segment) => {
    for (const segment of flightData.itineraries[0].segments){

      console.log("Flight: ", segment);

      //const origin = segment.departure.iataCode;
      const destination = segment.arrival.iataCode;
      console.log("destination", destination)

      //const originCoords = await findCoordsFromAirportCode(origin)
      const destinationCoords = await findCoordsFromAirportCode(destination)

      //console.log("originCoords", originCoords)
      console.log("destinationCoords", destinationCoords)

      // addFlightPathCoords({
      //   lat : destinationCoords.latitude, 
      //   lng : destinationCoords.longitude
      // });

      flightPathCoords.push({
        lat: destinationCoords.latitude, 
        lng: destinationCoords.longitude
      });

      console.log("Flight: ", segment);
      console.log("flightPathCoords:", flightPathCoords)

    };
      /*
      const originCoords = airportCoords[origin];
      const destinationCoords = airportCoords[destination];

      if (!originCoords || !destinationCoords) {
        console.error(`Coordinates not found for ${origin} or ${destination}`);
        return;
      }
        */
      
    console.log("FINAL flightPathCoords:", flightPathCoords);

      // Draw flight path
    setFlightPath(new window.google.maps.Polyline({
        // path: [{lat : originCoords.latitude, lng : originCoords.longitude}, 
        //       {lat : destinationCoords.latitude, lng : destinationCoords.longitude}],
        path: flightPathCoords,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map,
      })
    );

      /*
      flightPath = new window.google.maps.Polyline({
        path: [{lat : originCoords.latitude, lng : originCoords.longitude}, 
               {lat : destinationCoords.latitude, lng : destinationCoords.longitude}],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map,
      });
      */

    // });

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
        console.log("results[0].geometry.location:", results)
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
      console.log("nearestAirport:" , nearestAirport[0]);
      console.log("latitude:" , latitude);
      console.log("longitude:" , longitude);
      console.log("next nearestAirport:" , nearestAirport[1]);
      console.log("latitude:" , latitude);
      console.log("longitude:" , longitude);
      console.log("next nearestAirport:" , nearestAirport[2]);
      console.log("latitude:" , latitude);
      console.log("longitude:" , longitude);
      //const destTemperature = async (latitude, longitude, departureDate) => {

      let g_departureDate = "2025-03-14";

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
      
      if (nearestAirport) {
        console.log(`Nearest airport found: ${nearestAirport[0].iataCode}`);
        return nearestAirport;
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
      // const response = await axios.get(`http://localhost:${BACKEND_PORT}/api/nearest-airports`, {
      console.log("CALLING : ", `http://${APP_SERVER_HOME}/api/nearest-airports`)
        const response = await axios.get(`http://${APP_SERVER_HOME}/api/nearest-airports`, {
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

      console.log("THREE NEAREST AIRPORTS:", response.data.nearestAirports.slice(0, 3))

      return response.data.nearestAirports.slice(0, 3)
      //return response.data.nearestAirports[0];
      //return response.data.nearestAirports;
    } catch (err) {
      console.error('Error fetching nearest airports:', err);
      alert('Failed to fetch nearest airports.');
    }
  };  

  const calculateRoute = async (directionsService, directionsRenderer, start, end, transportMode, setDetails) => {

    console.log("----------------------IN CALCULATE ROUTE --------------------------------");

  //const calculateRoute = async (directionsService, directionsRenderer, start, end) => {
    return new Promise((resolve, reject) => {
      if (!start || !end) {
        alert("Please enter valid locations.");
        return;
      }

      var transitMode = "";

      if (transportMode == "driving"){
        transitMode = window.google.maps.TravelMode.DRIVING;
      }
      else{
        transitMode = window.google.maps.TravelMode.TRANSIT;
      }

      const request = {
        origin: start,
        destination: end,
        travelMode: transitMode,
      };

      console.log("REQUEST: ", request) 

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

  const formatTimeAsHHMM = (unFormattedDate) => {
    const date = new Date(unFormattedDate);
    return `${date.getHours() < 10 ? "0" + date.getHours(): date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes()}`;
    
  }

  const addFlight = (newFlight) => {
    
    //const date = new Date(newFlight.itineraries[0].segments[0].departure.at);
    //const formatted = `${date.getHours() < 10 ? "0" + date.getHours(): date.getHours()}:${date.getMinutes()}`;

    //console.log("Formatted:",formatted);
    console.log("NEWFLIGHT = ", newFlight)

    //newFlight.FormattedDepartureTime = formatted
    newFlight.FormattedDepartureTime = formatTimeAsHHMM(newFlight.itineraries[0].segments[0].departure.at);

    let len = (newFlight.itineraries[0].segments.length) - 1

    //console.log("LEN = ", len)
    //console.log("newFlight.itineraries[0].segments[len].arrival.at", newFlight.itineraries[0].segments[len].arrival.at)

    //console.log("FormattedArrivalTime = ", newFlight.itineraries[0].segments.length)

    newFlight.FormattedDepartureTime = formatTimeAsHHMM(newFlight.itineraries[0].segments[0].departure.at);
    newFlight.FormattedArrivalTime = formatTimeAsHHMM(newFlight.itineraries[0].segments[len].arrival.at);

    let formattedDuration = newFlight.itineraries[0].duration.replace("PT", "");
    formattedDuration = formattedDuration.toLowerCase();
    formattedDuration = formattedDuration.replace("h", "h ");

    console.log("formattedDuration:", formattedDuration);
    newFlight.formattedFlightDuration = formattedDuration

    console.log("newFlight.FormattedDepartureTime:", newFlight.FormattedDepartureTime);
    setFlights(prevFlights => [...prevFlights, newFlight]);
  };
  
  const fetchFlightData = async (originLocationCode, destinationLocationCode, deptDate) => {
    
    console.log("----------------------IN FETCH FLIGHT DATA --------------------------------");
    console.log("deptDate:", deptDate);
    
    //const departureDate = new Date().toISOString().slice(0, 10); // ref: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
    //const url = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1`;


    try {
      // console.log("iNSIDE TRY BLOCK:");
      // console.log(" try g_departureDate:", g_departureDate);
      // console.log("originLocationCode:", originLocationCode);
      // console.log("destinationLocationCode:", destinationLocationCode);
      // console.log("before get call ");
      const response = await axios.get(`http://${APP_SERVER_HOME}/api/flight-data`, {
        //params: { g_departureDate,
        params: { deptDate,
          originLocationCode,
          destinationLocationCode },
      });

      // console.log("after get call ");
      console.log("response.data:", response.data);
      if (response.data && response.data.length > 0) {
        //displayFlightsOnMap(response.data[0]);

        // const cheapestFlight = response.data.reduce((prev, curr) => 
        //   parseFloat(curr.price.grandTotal) < parseFloat(prev.price.grandTotal) ? curr : prev
        // );

        setFlights([]);

        addFlight(response.data[0]);
        addFlight(response.data[1]);
        addFlight(response.data[2]);

        const date = new Date("2021-02-15T20:30:00+01:00");
        const formatted = `${date.getHours()}:${date.getMinutes()}`;

        console.log("NEW DATE:", formatted);

        //console.log("FLIGHTDATADETAILS= ", flights);

        const cheapestFlight = response.data[0].itineraries[0].segments[0].arrival.at;

        // const arrivalDate = response.data[0].itineraries[0].segments[0].arrival.at
        // const departDate = response.data[0].itineraries[0].segments[0].departure.at

        console.log("Cheapest Flight Found:", cheapestFlight);
        
        //const originCoords = airportCoords[originLocationCode];
        //const destinationCoords = airportCoords[destinationLocationCode];

        let originCoords = await findCoordsFromAirportCode(originLocationCode);
        let destinationCoords = await findCoordsFromAirportCode(destinationLocationCode);

        let flightDistance = "N/A";
        if (originCoords && destinationCoords) {
          // flightDistance = (haversine(
          //   { lat: originCoords.lat, lon: originCoords.lng },
          //   { lat: destinationCoords.lat, lon: destinationCoords.lng }
          // )).toFixed(2) + " km"; // Convert meters to km
          flightDistance = findHaversine(originCoords, destinationCoords);
        }

        console.log(response.data[0]);
        console.log("setFlightDetails duration=", response.data[0].itineraries[0].duration.replace("PT", ""));

        setFlightDetails({
          //distance: "N/A", // Flight API might not provide exact distance
          distance: flightDistance,
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

        //displayFlightsOnMap(response.data[0]);

        return(true);

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

        console.log('No flight data found found for', originLocationCode, 'to ', destinationLocationCode);
        return(false);

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

  const handleSearch = async (startPoint, endPoint, deptDate, originForm) => {

    console.log("----------------------IN HANDLE SEARCH --------------------------------");

    if (!startPoint || !endPoint) {
      alert("Please enter valid start and end locations.");
      return;
    }

    setStartPoint(startPoint);
    setEndPoint(endPoint);
    
    if (!deptDate) {
      alert("Please enter valid date.");
      return;
    }
    else{
      console.log("deptDate:", deptDate);
      //await setGDepartureDate(deptDate);
      setDeptDate(deptDate);
      setGDepartureDate((prev) => {
        console.log("Previous state:", prev);
        console.log("New state:", deptDate);
        return deptDate;
      });      
      console.log("GDEPTDATE:", g_departureDate);
    }

    if (showAirports){
      if (showFlights && showJourney && originForm == "from_find_nearest_airports"){
        setShowJourney(false);
        setShowFlights(false);
      }
    }

    if (flightPath){
      flightPath.setMap(null);
    }

    if (originForm == "from_find_nearest_airports"){
      let startAirports = [];
      let endAirports = [];

      startAirports = await findNearestAirport(startPoint);
      endAirports = await findNearestAirport(endPoint);

      setStartAirports(startAirports);
      setEndAirports(endAirports);

      // remove joint calls
      let flightFound = false; // Flag to track if a flight is found

      console.log("startAirports:", startAirports);
      console.log("endAirports:", endAirports);
      
      for (let i = 0; i < 3 && !flightFound; i++) {
        for (let j = 0; j < 3 && !flightFound; j++) {

          let response = {}
          console.log("i:", i, "j:", j)

          if (startAirports[i] && endAirports[j] && startAirports[i]?.iataCode && endAirports[j]?.iataCode){
            //response = await fetchFlightData(startAirports[i]?.iataCode, endAirports[j]?.iataCode, deptDate, setFlightDetails);
          // }
          response = await fetchFlightData(startAirports[i]?.iataCode, endAirports[j]?.iataCode, deptDate);

          // console.log("Object.keys(response).length:", Object.keys(response).length)

          // if (response && Object.keys(response).length > 0) {
            console.log("Flight found:", response);
            console.log("Start Airport:", startAirports[i].iataCode);
            console.log("End Airport:", endAirports[j].iataCode);

            flightFound = true; // Set flag to exit loops
          } else {
            console.log(`No flights found from ${startAirports[i]?.iataCode} to ${endAirports[j]?.iataCode}`);
          }
        }
      }

      if (!flightFound) {
        console.log("No valid flights found after checking all options.");
      }
      else{
        setShowAirports(true);
      }

    }
    else if (originForm == "from_find_flights"){
      //let response = await fetchFlightData(selectedStartAirport?.iataCode, selectedEndAirport?.iataCode, deptDate, setFlightDetails);
      let response = await fetchFlightData(selectedStartAirport?.iataCode, selectedEndAirport?.iataCode, deptDate);

      let qSelect = document.querySelector('input[name="transport_mode"]:checked').value;

      const directionsService1 = new window.google.maps.DirectionsService();
      const directionsService2 = new window.google.maps.DirectionsService();

      await calculateRoute(
        directionsService1,
        directionsRenderer1,
        startPoint,
        `${selectedStartAirport.iataCode} Airport`,
        qSelect,
        setGroundDetailsStart
      );
      await calculateRoute(
        directionsService2,
        directionsRenderer2,
        `${selectedEndAirport.iataCode} Airport`,
        endPoint,
        qSelect,
        setGroundDetailsEnd
      );

      setShowFlights(true);
    }

    // /*

    // let qSelect = document.querySelector('input[name="transport_mode"]:checked').value;

    // console.log('VALUE OF RADIO:', qSelect);

    // /*
    // axios.get(`http://localhost:5000/api/nearest-airports?latitude=53.381194&longitude=-6.592497`)
    // .then(response => {
    //   console.log(response.data);
    // })
    // .catch(error => {
    //   console.error('Error fetching data:', error);
    // });
    // */
  
    // //console.log(`Searching for nearest airports for start point: ${startPoint} and end point: ${endPoint}`);
  
    // // Get nearest airports for both start and end points
    // //const startAirport = await findNearestAirport(startPoint);
    // //const endAirport = await findNearestAirport(endPoint);

    
    // // Get nearest airports (if no selection made)
    // /*
    // let startAirport = selectedStartAirport
    //   ? { iataCode: selectedStartAirport }  // Use selected airport
    //   : await findNearestAirport(startPoint);

    // let endAirport = selectedEndAirport
    //   ? { iataCode: selectedEndAirport }  // Use selected airport
    //   : await findNearestAirport(endPoint);
    // */

    // // let startAirports = [];
    // let endAirports = [];

    // let startSelectedAirportObj = {};
    // let endSelectedAirportObj = {};

    // if (selectedStartAirport.iataCode){
    //   setShowFlights(true);
    //   console.log("IN selectedStartAirport: ", selectedStartAirport);
    //   //addStartAirport(selectedStartAirport);
    //   //startAirports[0] = selectedStartAirport;
    //   //setStartAirports(startAirport);
    //   startSelectedAirportObj = selectedStartAirport;
    // }
    // else{
    //   startAirports = await findNearestAirport(startPoint);
    //   //setStartAirports(startAirport);
    // }

    // console.log("startAirport:", startAirports);

    // if (selectedEndAirport.iataCode){
    //   console.log("IN selectedEndAirport: ", selectedEndAirport);
    //   //addEndAirport(selectedEndAirport);
    //   //endAirports[0] = selectedEndAirport;
    //   //setStartAirports(endAirport);
    //   endSelectedAirportObj = selectedEndAirport;
    // }
    // else{
    //   endAirports = await findNearestAirport(endPoint);
    //   //setStartAirports(startAirport);
    // }

    // console.log("endAirport:", endAirports);

    // setStartAirports(startAirports);
    // setEndAirports(endAirports);

    // /*
    // if (!startAirport || startAirport.length < 3 || !endAirport || endAirport.length < 3) {
    //   console.error("Not enough nearest airports found.");
    //   return;
    // }
    //   */
  
    // if (!startAirports || !endAirports) {
    //   alert("Could not find nearest airports.");
    //   return;
    // }
  
    // console.log("Start Airports:", startAirports[0]?.code, startAirports[1]?.code, startAirports[2]?.code);
    // console.log("End Airports:", endAirports[0]?.code, endAirports[1]?.code, endAirports[2]?.code);
  
    // // const directionsService1 = new window.google.maps.DirectionsService();
    // // const directionsService2 = new window.google.maps.DirectionsService();
  
    // // Route 1: Start Point -> Nearest Airport

    // console.log("BEFORE groundDetailsStart=", groundDetailsStart);
    // console.log("groundDetailsStart.duration=", groundDetailsStart.duration);
    // console.log("groundDetailsEnd.duration=", groundDetailsEnd.duration);
    // console.log("flightDetails.duration=", flightDetails.duration);

    // console.log("BEFORE startPoint=", startPoint);
    // //console.log("BEFORE airport=", startAirports.code);

    // /*
    // let startDistance, startDuration = await calculateRoute(
    //   directionsService1,
    //   directionsRenderer1,
    //   startPoint,
    //   `${startAirport.code} Airport`
    //   //setGroundDetailsStart
    // );
    // */
    // let i = 0;

    // console.log("startAirport[i]:", startAirports[i])

    // /*
    // while (i != 3) {
    //   let response = await calculateRoute(
    //     directionsService1,
    //     directionsRenderer1,
    //     startPoint,
    //     `${startAirport[i].iataCode} Airport`,
    //     qSelect,
    //     setGroundDetailsStart
    //   );

    //   if (response){
    //     break;
    //   }
    //   else{
    //     i++;
    //   }
    // }

    // console.log("AFTER startDistance=", groundDetailsStart.distance);
    // console.log("AFTER startDuration=", groundDetailsStart.duration);

    
    // setGroundDetailsStart({
    //   distance: startDistance,
    //   duration: startDuration
    // })
      
  
    // console.log("BEFORE groundDetailsEnd=", groundDetailsEnd);
    // console.log("groundDetailsStart.duration=", groundDetailsStart.duration);
    // console.log("groundDetailsEnd.duration=", groundDetailsEnd.duration);
    // console.log("flightDetails.duration=", flightDetails.duration);

    // i = 0;

    // while (i != 3) {
    //   let response = await calculateRoute(
    //     directionsService2,
    //     directionsRenderer2,
    //     `${endAirport[i].iataCode} Airport`,
    //     endPoint,
    //     qSelect,
    //     setGroundDetailsEnd
    //   );

    //   if (response){
    //     break;
    //   }
    //   else{
    //     i++;
    //   }
    // }
    // */

    // console.log("AFTER endDistance=", groundDetailsEnd.distance);
    // console.log("AFTER endDuration=", groundDetailsEnd.duration);

    // /*
    // // Route 2: Nearest Airport -> End Point
    // let endDistance, endDuration = await calculateRoute(
    //   directionsService2,
    //   directionsRenderer2,
    //   `${endAirport.code} Airport`,
    //   endPoint
    //   //setGroundDetailsEnd
    // );

    // setGroundDetailsEnd({
    //   distance: endDistance,
    //   duration: endDuration
    // })
    //   */
  
    // // Fetch flight data from Amadeus API

    // /*
    // i = 0;
    // let j = 0;

    // while (i != 3) {
    //   while (j != 3) {
    //     let response = await fetchFlightData(startAirport[i].iataCode, endAirport[j].iataCode, setFlightDetails);
    //     if (response){
    //       console.log("J RES: ", response);
    //       await calculateRoute(
    //         directionsService1,
    //         directionsRenderer1,
    //         startPoint,
    //         `${startAirport[i].iataCode} Airport`,
    //         qSelect,
    //         setGroundDetailsStart
    //       );
    //       await calculateRoute(
    //         directionsService2,
    //         directionsRenderer2,
    //         `${endAirport[j].iataCode} Airport`,
    //         endPoint,
    //         qSelect,
    //         setGroundDetailsEnd
    //       );

    //       break;
    //     }
    //     else{
    //       console.log("NO FLIGHTS FOUND FROM", startAirport[i].iataCode, " TO ", endAirport[j].iataCode);
    //       j++;
    //     }
    //   }
    //   let response = await fetchFlightData(startAirport[i].iataCode, endAirport[j].iataCode, setFlightDetails);
    //   if (response){
    //     console.log("I RES: ", response);
    //     console.log("startAirport[i].iataCode:", startAirport[i].iataCode);
    //     console.log("endAirport[i].iataCode:", endAirport[j].iataCode);
    //     await calculateRoute(
    //       directionsService1,
    //       directionsRenderer1,
    //       startPoint,
    //       `${startAirport[i].iataCode} Airport`,
    //       qSelect,
    //       setGroundDetailsStart
    //     );
    //     await calculateRoute(
    //       directionsService2,
    //       directionsRenderer2,
    //       `${endAirport[j].iataCode} Airport`,
    //       endPoint,
    //       qSelect,
    //       setGroundDetailsEnd
    //     );

    //     break;
    //   }
    //   else{
    //     console.log("NO FLIGHTS FOUND FROM", startAirport[i].iataCode, " TO ", endAirport[j].iataCode);
    //     i++;
    //   }
    // }
    //   */

    // // remove joint calls
    // let flightFound = false; // Flag to track if a flight is found

    // console.log("startAirports:", startAirports)
    // console.log("endAirports:", endAirports)

    
    
    // for (let i = 0; i < 3 && !flightFound; i++) {
    //   for (let j = 0; j < 3 && !flightFound; j++) {

    //     let response = {}
    //     console.log("i:", i, "j:", j)

    //     if (startAirports[i] && endAirports[j] && startAirports[i]?.iataCode && endAirports[j]?.iataCode){
    //       response = await fetchFlightData(startAirports[i]?.iataCode, endAirports[j]?.iataCode, deptDate, setFlightDetails);
    //     // }

    //     // console.log("Object.keys(response).length:", Object.keys(response).length)

    //     // if (response && Object.keys(response).length > 0) {
    //       console.log("Flight found:", response);
    //       console.log("Start Airport:", startAirports[i].iataCode);
    //       console.log("End Airport:", endAirports[j].iataCode);
          
    //       // Run calculateRoute only once
    //       await calculateRoute(
    //         directionsService1,
    //         directionsRenderer1,
    //         startPoint,
    //         `${startAirports[i].iataCode} Airport`,
    //         qSelect,
    //         setGroundDetailsStart
    //       );
    //       await calculateRoute(
    //         directionsService2,
    //         directionsRenderer2,
    //         `${endAirports[j].iataCode} Airport`,
    //         endPoint,
    //         qSelect,
    //         setGroundDetailsEnd
    //       );

    //       flightFound = true; // Set flag to exit loops
    //     } else {
    //       console.log(`No flights found from ${startAirports[i]?.iataCode} to ${endAirports[j]?.iataCode}`);
    //     }
    //   }
    // }

    // //displayItineraryDetails();
    // */

    // if (!flightFound) {
    //   console.log("No valid flights found after checking all options.");
    // }
    // else{
    //   setShowAirports(true);
    // }
    // await totalDuration();
    //destTemperature(longitude, latitude, departureDate);
  };

  return (
    <div>
      <h1>Flight Journey Planner</h1>
      <SearchForm onSearch={handleSearch} />
      <div id="map" style={{ height: "600px", width: "100%" }}></div>
      <div>
        {showAirports? displayAvailableAirports():""}
        {showFlights? displayAvailableFlights():""}
        {showJourney? displayItineraryDetails():""}
      </div>
    </div>
  );
};

export default GoogleMap;
