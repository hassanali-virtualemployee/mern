const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyBfFRFIr8sLV9lWeVZLEbaCqC4B5sStV90";

//if we have no api keys then return static coordinates
function getCoordsForAddress(address) {
  return {
    lat: 40.7484445,
    lng: -73.9878531,
  };
}

//if we have an api key then use below function
//async await is built in modern javascript
//The word “async” before a function means one simple thing: a function always returns a promise.
//Other values are wrapped in a resolved promise automatically.
//There’s another keyword, await, that works only inside async functions, and it’s pretty cool.
//now we can use package for http request axios, npm install --save axios
//Get rid of special characters or whitespace with the help of global function available in JavaScript in Node.js
//by encodeURIComponent function
// async function getCoordsForAddress(address) {
//   const response = await axios.get(
//     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address
//     )}&key=${API_KEY}`
//   );

//   //axios gives the data field on the response object that hold our data
//   const data = response.data;

//   if (!data || data.status === "ZERO_RESULTS") {
//     const error = new HttpError(
//       "Could not find location for the specified address",
//       422
//     );
//     throw error;
//   }

//   //If we have no error
//   const coordinates = data.results[0].geometry.location;

//   return coordinates;
// }

module.exports = getCoordsForAddress;
