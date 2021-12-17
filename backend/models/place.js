//Schema is the blueprint of the document that we want to store so in our case the blueprint of the place for example we can make sure that the place must contain a title and based on the Schema we create so called Model and each instance of this model in our code will then result in a new document

//Schema and the mongoose model are concepts related to mongoose
const mongoose = require('mongoose');

//this javascript object is the blueprint of our later document
const placeSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' } //we have to use here user id for type and add reference to User model by add ref property

});

//this javascript object is the blueprint of our later document
// const placeSchema = new Schema({
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     image: { type: String, required: true },
//     address: { type: String, required: true },
//     location: {
//         lat: { type: Number, required: true },
//         lng: { type: Number, required: true }
//     },
//     creator: { type: String, required: true }

// });

//First argument is the model name and it is for collection name in our case places there Model name 'Place' and second arument is Schema
module.exports = mongoose.model('Place', placeSchema);