import React, { useEffect } from "react";
import { useState } from "react";
import ReactDOM from 'react-dom/client';

const SearchForm = (onSearch) => {
  const [startPoint, setSP] = useState("");
  const [endPoint, setEP] = useState("");

  // function that gets called by Google Maps app to activate function: https://react-hook-form.com/docs/useform/handlesubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(startPoint, endPoint);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
      <label>Start point:
        <input
          type = "text"
          value = {startPoint}
          onChange = {(s) => setSP(s.target.value)}
        />
      </label>
      <label>End point:
        <input
          type = "text"
          value = {endPoint}
          onChange = {(e) => setEP(e.target.value)}
        />
      </label>
      <button type="submit">Search</button>
    </form>
  )
}

const GoogleMap = () => {
  useEffect(() => {

    const loadGoogleMapsAPI = () => {
      const script = document.createElement("script");
      script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBoPryoNFGz_SvBneuhkfgIcMI381f88fQ&callback=initMap";
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
    }
    const initMap = () => {

      const airportCoords = {
        DUB: { lat: 53.4256, lng: -6.2574 }, // Dublin (DUB)
        LHR: { lat: 51.468, lng: -0.4551 } // London (LHR)
      };

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 53.4256, lng: -6.2574 }, // Default to Dublin
        zoom: 5
      });

      const directionsService1 = new window.google.maps.DirectionsService();
      const directionsRenderer1 = new window.google.maps.DirectionsRenderer();
      directionsRenderer1.setMap(map);

      const directionsService2 = new window.google.maps.DirectionsService();
      const directionsRenderer2 = new window.google.maps.DirectionsRenderer();
      directionsRenderer2.setMap(map);

      // initialise airport codes
      const flightRouteCodes = ["DUB", "LHR"];
      const flightRoute = flightRouteCodes.map((code) => airportCoords[code]);

      const flightPath = new window.google.maps.Polyline({
        path: flightRoute,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
      });

      const startPoint = "temple bar";
      const airport1 = "dublin airport";
      const airport2 = "lhr airport";
      const endPoint = "big ben";

      calculateRoute1(directionsService1, directionsRenderer1, startPoint, airport1)
      calculateRoute2(directionsService2, directionsRenderer2, airport2, endPoint)
      /*
      calculateRoute1(directionsService1, directionsRenderer1);
      calculateRoute2(directionsService2, directionsRenderer2);
      */

      flightPath.setMap(map);
    };

    //const calculateRoute1 = (directionsService, directionsRenderer) => {
    const calculateRoute1 = (directionsService, directionsRenderer, 
                             startPoint, airport1) => {
      //const start = "temple bar";
      //const end = "dublin airport";
      
      const start = startPoint;
      const end = airport1;

      if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
      }

      const request = {
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.TRANSIT
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          alert("Directions request failed due to " + status);
        }
      });
    };

    //const calculateRoute2 = (directionsService, directionsRenderer) => {
    const calculateRoute2 = (directionsService, directionsRenderer, 
                             airport2, endPoint) => {
      //const start = "LHR airport";
      //const end = "big ben";

      const start = airport2;
      const end = endPoint;

      if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
      }

      const request = {
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.TRANSIT
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          alert("Directions request failed due to " + status);
        }
      });
    };


    loadGoogleMapsAPI();
  }, []);

  const calculateRoute = (start, end) => {
    if (start == null || end == null){
      alert("Enter in a valid start and end point");
    }

    const request = {
      origin: start,
      destination: end,
      travelMode: window.google.maps.TravelMode.TRANSIT,
    }

    directionsService1.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer1.setDirections(result);
      } else {
        alert("Directions request failed due to " + status);
      }
    });
  }

  return (
    <div>
      <h1>Mapping Application</h1>
      <SearchForm onSearch={calculateRoute} />
      <div id="map" style={{ height: "600px", width: "100%" }}></div>
    </div>
  );
}

export default GoogleMap;