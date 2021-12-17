//class keyword is available in the modern javascript, no extra build tool
// a class is a blueprint of the javascript object
class HttpError extends Error {
    constructor(message, errorCode) {
        //to call the constructor of base class means Error class and forward the message to it
        super(message);   //Add a "message" property
        this.code = errorCode; //Add a "code" propert
    }
}

//exports this class
module.exports = HttpError;