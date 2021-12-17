const express = require("express");

const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get('/', usersController.getUsers);

//Create signup route and this is for POST Request
router.post('/signup', [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 })
], usersController.signup);

//Create login route and this is for POST Request
router.post('/login', usersController.login);

//step 4 - Now we need to link these routes with app.js so for that we export this route
module.exports = router;
