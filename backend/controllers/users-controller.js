const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const User = require('../models/user');

const getUsers = async (req, res, next) => {
    //add empty javascript object and exclude password from user object by add -password or if want email, name then just add second argument as 'email name' which will return email and name only in user object
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later', 500);
        return next(error); 
    }
    //find return an arrary therefore we cannot use toObject
    res.json({ users: users.map( user => user.toObject({ getters: true }) ) });
};

const signup = async (req, res, next) => {

    //Check Input validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      //422 status code is for invalid user input
      return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { name, email, password} = req.body;

    //findOne() method simplify one document matching the criteria in the argument of our method so that we can easily check if the email of the user exist already and this asynchronous task so wrap this in try catch
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }

    if(existingUser){
        const error = new HttpError('User exists already, please login instead', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://www.kindpng.com/picc/m/136-1369892_avatar-people-person-business-user-man-character-avatar.png',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again', 500);
        return next(error);
    }

    res.status(201).json({user: createdUser.toObject({ getters: true })});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later', 500);
        return next(error);
    }

    //status 401 means that authentication failed
    if(!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log you in.' , 401);
        return next(error);
    }

    res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;