import React, { useEffect } from "react";

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

      const flightRouteCodes = ["DUB", "LHR"];
      const flightRoute = flightRouteCodes.map((code) => airportCoords[code]);

      const flightPath = new window.google.maps.Polyline({
        path: flightRoute,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
      });

      calculateRoute1(directionsService1, directionsRenderer1);
      calculateRoute2(directionsService2, directionsRenderer2);

      flightPath.setMap(map);
    };

    const calculateRoute1 = (directionsService, directionsRenderer) => {
      const start = "temple bar";
      const end = "dublin airport";

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

    const calculateRoute2 = (directionsService, directionsRenderer) => {
      const start = "LHR airport";
      const end = "big ben";

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
  }, [])

  return (
    <div>
      <h1>My First Google Map</h1>
      <div id="map" style={{ height: "600px", width: "100%" }}></div>
    </div>
  );
}

export default GoogleMap;