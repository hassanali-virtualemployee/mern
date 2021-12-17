//step 1
const express = require("express");

const placesController = require("../controllers/places-controller");

const { check } = require("express-validator");

//step 2
const router = express.Router();

//step 3 - Get place on basis of place id
router.get("/:pid", placesController.getPlaceById); //we not use here getPlaceById(), we just point that function by calling its name

//Get places on basis of user Id
router.get("/user/:uid", placesController.getPlacesByUserId);

//Create place route and this is for POST Request
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

//Update place route and this is for PATCH Request
router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(), 
    check("description").isLength({ min: 5 })
  ],
  placesController.updatePlace
);

//Delete place route
router.delete("/:pid", placesController.deletePlace);

//step 4 - Now we need to link these routes with app.js so for that we export this route
module.exports = router;
