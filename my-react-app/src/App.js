import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const SearchForm = ({ onSearch }) => {
  const [startPoint, setSP] = useState("");
  const [endPoint, setEP] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(startPoint, endPoint);
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

const GoogleMap = () => {
  const [map, setMap] = useState(null);
  const [directionsRenderer1, setDirectionsRenderer1] = useState(null);
  const [directionsRenderer2, setDirectionsRenderer2] = useState(null);
  const [groundDetailsStart, setGroundDetailsStart] = useState({});
  const [groundDetailsEnd, setGroundDetailsEnd] = useState({});
  const [flightDetails, setFlightDetails] = useState({});

  useEffect(() => {
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

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
            <td>Ground (Start to Nearest Airport)</td>
            <td>{groundDetailsStart.distance}</td>
            <td>{groundDetailsStart.duration}</td>
          </tr>
          <tr>
            <td>Flight</td>
            <td>{flightDetails.duration}</td>
            <td>---</td>
          </tr>
          <tr>
            <td>Ground (Nearest Airport to End)</td>
            <td>{groundDetailsEnd.distance}</td>
            <td>{groundDetailsEnd.duration}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const airportCoords = {
    DUB: { lat: 53.4256, lng: -6.2574 }, // Dublin Airport
    LHR: { lat: 51.468, lng: -0.4551 }, // London Heathrow
    JFK: { lat: 40.6413, lng: -73.7781 }, // JFK
    LAX: { lat: 33.9416, lng: -118.4085 }, // LAX
  };

  const getAirportCoords = (iataCode) => airportCoords[iataCode] || null;

  const displayFlightsOnMap = (flights) => {
    if (!map) {
      console.error("Map is not initialized yet.");
      return;
    }

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
  };

  const initMap = () => {
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
    const airports = {
      DUB: { lat: 53.4213, lng: -6.2701 },
      LHR: { lat: 51.4700, lng: -0.4543 },
    };

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve) =>
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK") resolve(results[0].geometry.location);
        else resolve(null);
      })
    );

    if (!response) return null;

    let nearestAirport = null;
    let shortestDistance = Infinity;
    Object.entries(airports).forEach(([code, coords]) => {
      const distance = Math.sqrt(
        Math.pow(response.lat() - coords.lat, 2) +
          Math.pow(response.lng() - coords.lng, 2)
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestAirport = { code, coords };
      }
    });

    return nearestAirport;
  };

  const calculateRoute = (directionsService, directionsRenderer, start, end, setDetails) => {
    if (!start || !end) {
      alert("Please enter valid locations.");
      return;
    }

    const request = {
      origin: start,
      destination: end,
      travelMode: window.google.maps.TravelMode.TRANSIT,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        const leg = result.routes[0].legs[0]; // Extract first leg of journey
        setDetails({
          distance: leg.distance.text, // Example: "15 km"
          duration: leg.duration.text, // Example: "30 mins"
        });
      } else {
        alert("Directions request failed: " + status);
      }
    });
  };


  const fetchFlightData = async (origin, destination) => {
    const departureDate = "2025-07-01";
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer n3PxAq7ZPhlmsAGCrAfPIhP8XbB0`,
        },
      });

      const data = await response.json();
      console.log("Amadeus API Response:", data);

      console.log(data);

      if (data.errors || !data.data || data.data.length === 0) {
        alert("No flights found!");
        //alert(flight.itineraries);
        if (data.errors){
          alert("Data errored out");
        }
        if (!data.data){
          alert("No data");
        }
        if (data.data.length === 0){
          alert("Data length is zero");
        }
        return;
      }

      const flight = data.data[0]; // First available flight
      const distance = flight.itineraries[0]?.distance?.replace("PT", "").toLowerCase(); // Example: "2h30m"
      const duration = flight.itineraries[0]?.duration?.replace("PT", "").toLowerCase(); // Example: "2h30m"

      setFlightDetails({
        distance: distance, // Flight distance
        duration: duration, // Flight time
      });

      displayFlightsOnMap(data.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleSearch = async (startPoint, endPoint) => {
    if (!startPoint || !endPoint) {
      alert("Please enter valid start and end locations.");
      return;
    }

    // Find nearest airports
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
    calculateRoute(
      directionsService1,
      directionsRenderer1,
      startPoint,
      `${startAirport.code} Airport`,
      setGroundDetailsStart
    );

    // Route 2: Nearest Airport -> End Point
    calculateRoute(
      directionsService2,
      directionsRenderer2,
      `${endAirport.code} Airport`,
      endPoint,
      setGroundDetailsEnd
    );

    // Fetch flight data from Amadeus API
    fetchFlightData(startAirport.code, endAirport.code, setFlightDetails);
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
