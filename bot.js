const fs = require('fs');
const Promise = require('bluebird')
const { auth } = require('./config/config.js');
const T = auth();
var stream = T.stream('statuses/filter', { track: 'mfer', language: 'en' })

stream.on('tweet', async function (tweet) {
    console.log("Starting RKO Reply Tweet")

})