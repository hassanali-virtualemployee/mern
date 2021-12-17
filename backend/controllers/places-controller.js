const uuid = require("uuid/v4");

const { validationResult } = require("express-validator");

const mongoose = require("mongoose");

//import HttpError module class
const HttpError = require("../models/http-error");

const getCoordsForAddress = require("../util/location");

//Import Place Model
const Place = require("../models/place");

//Import User model for add relationship when create place
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  //findById() is a static method here it mean it is not used on the instance of Place but directly on the Place constructor function and findById() does not return a promise. If we want real promise use exec() after findById() i.e. Place.findById().exec() but we don't need promise
  let place;
  try {
    //findById() still allows to async await and this is the mongoose feature available
    place = await Place.findById(placeId);
  } catch (err) {
    //this error occurs when something is missing in GET API
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  //This happen when we have no place exist in a database for corresponding placeId
  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }

  //change mongoDB object to Javascript object by add toObject() after place and remove '_' from _id pass getters: true in toObject and getters tells to mongoose to return an id as a string by add new propert id in created object
  res.json({ place: place.toObject({ getters: true }) }); // => {place} => {place: place}
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  //find() return first element, so we use here filter() which return a new array of full
  //of elements which fulfill this criteria
  // let places;
  // try {
  //   //find() still allows to async await and this is the mongoose feature available and find() would return all places this means if we have a specific place by the userid then we have to userid as an argument in find() method. find() return an array here
  //   places = await Place.find({ creator: userId });
  // } catch (err) {
  //   const error = new HttpError(
  //     "Fetching places failed, please try again later",
  //     500
  //   );
  //   return next(error);
  // }

  //We can use populate() method like in delete place and comment above code, above code is also correct
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {, this is when we use above commented code
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  //find returns an array so we can't use toObject() therefore we can use map() here
  res.json({
    places: userWithPlaces.places.map((place) => place.toObject({ getters: true }))
  });
};

//after create location.js file we use there axios therefore we make it async function
const createPlace = async (req, res, next) => {
  //this function will do, it will look into this req onject and see if there are any validation
  //errors which were detected based on setup in places-routes, so this will return you errors object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    //when we work in async mode throw not work correctly, we have to use next()
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  //object destructuring here is shortcut for doing this type const title = req.body.title for every property
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    //this will return a promise
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    //forward an error
    return next(error);
  }

  //need to create id, npm install --save uuid@7.0.3 - package for create unique ids
  // const title = req.body.title
  const createdPlace = new Place({
    title,
    description,
    image:
      "https://en.wikipedia.org/wiki/Empire_State_Building#/media/File:EmpireStateNewYokCity.jpg",
    address,
    location: coordinates,
    creator,
  });

  //check user id exist into the database
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user for provided id, please try again",
      404
    );
    return next(error);
  }

  console.log(user);

  //if this user is existing then we can do two things now, first we can store or create new document with our new place and second we can add place id to the corresponding user and both case are independent to each other.

  //if create place fails or add place id for corresponding user is fail then undo all operations

  //If both things succeed we want to continue and we want to change our documents to do that we need to use transactions and sessions. The transaction simply does just what I said. Transaction allow to perform multiple operations in isolation and potentially undo all the operations if one of them fails and the transactions are basically build on so called sessions. So to work with transactions we first set to start the session then we can initiate the transaction and once the transaction is successful the session is finish and the transactions are committed so with that our places are created and place id is stored in our user's document.

  try {
    const sess = await mongoose.startSession();

    //in our session we can start the transaction
    sess.startTransaction();

    await createdPlace.save({ session: sess });

    //now we need to check place id is also added to our user for that we can refer user here
    //push() is not the standard push() of javascript instead this method is used by mongoose which kind of allows mongoose to behind the scene establish the connection between the two models which are referring here to say and behind the scenes mongoDB graps the created place id that integrated in mongo's feature here and add it to the places field of the user so it is only add places id
    user.places.push(createdPlace);
    await user.save({ session: sess });

    //Once all these tasks are successful means place is created and place id added to the corresponding user then we want to make sure the session commits the transaction and this is asynchronous task and at this point the changes are really save in a database and if anything could have wrong in tasks, part of the session and transaction or changes would have been rollback automatically by mongoDB.
    //For transaction if we don't have collection so in our case we want to create new place this means we have a to create collection places manually now.
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  //201 status code is for sucessfully created
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  //Check Input validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    //findById() still allows to async await and this is the mongoose feature available
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  //then update the updatedPlace object
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    //populate method allows us to exacly to do that so to refer to a document stored in another collection and to work with data in that existing document of that other collection and to work with data in  that existing document of that other collection. To do so we need a relation between these two documents and these relations were established in User model with ref: 'Place' and in Place model file with ref: 'User', only if this connection is existing then we are allow to use populate otherwise this populate method would not work and the populate method needs one additional information about the document where we want to change something and in this document we need to refer a specific property and in our case this creator property because the creator property contains the user id. Mongoose then takes that id but searches to the entire data so the id allows us to search for the user and then to get back all the data stored in a user document
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    return next(error);
  }

  //check place id is already exists
  if (!place) {
    const error = new HttpError("Could not find place for this id", 404);
    return next(error);
  }

  //deleting place
  try {
    //deleting place and remove it from user
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    //we want to access places our places array by add places after creator and add pull(), pull() also remove the id
    place.creator.places.pull(place);

    //now we save our newly created user
    await place.creator.save({ session: sess });

    //after all successfull commit the transaction
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place" });
};

//we have to exports multiple function so we can't use module.exports because it use for single
exports.getPlaceById = getPlaceById; //exports.nameOfYourChoice but we use same name
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
