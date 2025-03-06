// https://stackoverflow.com/questions/75358761/i-was-trying-to-add-login-feature-through-prompt-inside-react-but-i-was-asked-t

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signing up with:", email, password);
    navigate("/google");
  };

  const handleSignUp = () => {
    //setEmail(prompt("Set email:"));
    //setPassword(prompt("Set password:"));

    //email = "abcd";
    //password = "1234";

    //setEmail("abcd");
    //setPassword("1234");

    if (!name || !email || !password || !phone || !street || !city || !zip){
      try{
        return (
          <div className="signUp">
            <h1>Please enter all required values</h1>
            <h1>Sign in failed, try again</h1>
            <form onSubmit={handleSignUp} style={{ marginBottom: "10px" }}>
            <label>
              Email:
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
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
      } catch (error){
        console.log("SIGNUP CATCH BLOCK ERROR: ", error);
      }
    }
    else{
      console.log("Creating user with email: ", email, " and password: ", password);

      // insert into db code

      try{
        const signUpReq = axios.post('http://localhost:8080/register',{
          name: name,
          email: email,
          password: password,
          phone: phone,
          address: {
            street: street,
            city: city,
            zip: zip
          }
        });
      } catch (error){
        console.log("ERROR: ", error);
      }

      navigate("/login");

      // navigate("/google");
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
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp} style={{ marginBottom: "10px" }}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <br></br>
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
      <br></br>
      <label>
        Phone:
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <br></br>
      <label>
        Address:
        <br></br>
        Street:
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
        City:
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        Zip:
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
      </label>
      <br></br>
      <button type="submit">Submit</button>
      </form>
    </div>
  );

  
};

export default SignUp;