const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

//step 5 - import places routes from places-routes.js and this is now simply a middleware
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

//Error Model
const HttpError = require("./models/http-error");

//strep 3
const app = express();

//now to get data out of the body, we use body-parser for post request because body not use for GET api
//now we add new middleware
app.use(bodyParser.json());

//add certain headers to the response so that when later a response is sent back by below routes it does have these headers attached
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); //This allow which domain have access and '*' is for all domains
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // which headers these requests sent by the browser may have
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

//step 6
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//api not found middleware- this middleware is only reach if we have some requests which didn't get response
//before and that can only be a request which we dont want to handle
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

//mention default error handling middleware function which have four parameters
//after all routes to make less duplicate code for errors. Thats means that this function
//will only be executed on request that have an error attached ot it to say. So this function
//will execute if any middleware in front of it yields an error
app.use((error, req, res, next) => {
  //if response header is sent is true that means we check if a response has already been sent
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

//check database server is connected then create nodejs server
//connect() returns promise therefore we can use then() and catch()
mongoose
  .connect(
    "mongodb+srv://hassanali:CXwCHbH2iO4YvV3b@cluster0.iowis.mongodb.net/mern2?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    //connect node.js server when database connected successfully
    console.log('Database Connected!');
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
