import React from 'react';

import './App.css';

//import { BrowserRouter, Route, Routes , Router } from 'react-router-dom';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';

import Preferences from '../Preferences/Preferences';

import Login from '../Login/login';

import SignUp from '../SignUp/signUp';

import GoogleMap from '../GoogleMap/googleMap';

function App() {
  return (
    <div className="wrapper">
      <h1></h1>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<Dashboard />} />
          <Route path="/google" element={<GoogleMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <></>
        </Routes>
      </Router>
    </div>
  );
}


export default App;