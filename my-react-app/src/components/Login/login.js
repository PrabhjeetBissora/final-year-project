// https://stackoverflow.com/questions/75358761/i-was-trying-to-add-login-feature-through-prompt-inside-react-but-i-was-asked-t

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Store error messages

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    navigate("/google");
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page

    //setEmail(prompt("Set email:"));
    //setPassword(prompt("Set password:"));

    //email = "abcd";
    //password = "1234";

    //setEmail("abcd");
    //setPassword("1234");

    if (!email || !password) {
      setError("Blank credentials, please try again.");
      return;
    }
    else{

      console.log("Logging in user with email: ", email, " and password: ", password);

      try{
        const request = await axios.get('http://localhost:8080/login',{
          params: {
            email: email,
            password: password
          }
        });
        console.log("REQUEST RETURNED:", request);
        if (request.data == true){
          navigate("/google");
        }
        else{
          setError("Invalid credentials, please try again.");
      return;
        }
      } catch (error){
        console.log("ERROR: ", error);
        setError("ERROR: ", error);
        return;
      }
      //console.log("Logged in user with email: ", email, " and password: ", password);
      //navigate("/google");
      //handleSubmit();
    }
  }

  /*
    <div className="App">
      <h1>Login successful</h1>
      <button type="button" onClick={handleSubmit}>
        Go to Travel App
      </button>
    </div>
  */

  return (
    <div className="App">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}
      <form onSubmit={handleLogin} style={{ marginBottom: "10px" }}>
      <label>
        Email:
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br></br>
      <label>
        Password:
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Search</button>
      </form>
    </div>
  );

  /*
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );

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
  */
};

export default Login;