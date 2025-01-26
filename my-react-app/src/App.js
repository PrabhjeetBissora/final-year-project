import logo from './logo.svg';
import './App.css';
import GoogleMap from './GoogleMap'
import React, { useEffect } from "react";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

function App() {
  return (
    <div>
      <GoogleMap/>
    </div>
  );
}

export default App;

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
  })
}