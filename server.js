// source: https://www.w3schools.com/REACT/DEFAULT.ASP

import React from 'react';
import ReactDOM from 'react-dom/client';

function Hello(props) {
  return <h1>Hello World!</h1>;
  console.log("Hello, this is a new JavaScript file!");
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<hello/>);