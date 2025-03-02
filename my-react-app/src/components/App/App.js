import React from 'react';

import './App.css';

//import { BrowserRouter, Route, Routes , Router } from 'react-router-dom';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';

import Preferences from '../Preferences/Preferences';

import GoogleMap from '../GoogleMap/googleMap';

function App() {
  return (
    <div className="wrapper">
      <h1>Application</h1>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<Dashboard />} />
          <Route path="/google" element={<GoogleMap />} />
          <></>
        </Routes>
      </Router>
    </div>
  );
}


export default App;