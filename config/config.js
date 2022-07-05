
const Twit = require('twit')
const dotenv = require("dotenv")
dotenv.config()

// auth methods
const auth = () => {
    let secret = {
        consumer_key: process.env.API_KEY,
        consumer_secret: process.env.SECRET_KEY,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
    }

    var client = new Twit(secret);
    return client;
}

module.exports = { auth };