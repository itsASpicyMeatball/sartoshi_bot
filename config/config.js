const { TwitterApi } = require("twitter-api-v2");
const dotenv = require("dotenv")
dotenv.config()

// auth methods
const auth = () => {
    const appOnlyClient = new TwitterApi(process.env.BEARER_TOKEN);
    return appOnlyClient.readWrite;
}

const userClientAuth = () => {
    const config = {
      appKey: process.env.API_KEY,
      appSecret: process.env.SECRET_KEY,
      // Following access tokens are not required if you are
      // at part 1 of user-auth process (ask for a request token)
      // or if you want a app-only client (see below)
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_TOKEN_SECRET,
    };
  const appOnlyClient = new TwitterApi(config);
  return appOnlyClient.readWrite;
};
module.exports = { auth, userClientAuth };