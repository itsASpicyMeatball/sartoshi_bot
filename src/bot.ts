const { userClientAuth } = require("../config/config.js");
const { Worker, isMainThread } = require("worker_threads");
const worker = new Worker("./src/twitter_worker.ts");
const userClient = userClientAuth();
const authorIdQueue:number[] = [];

async function sendTweet() {
    while (true) {
        console.log(authorIdQueue)
        const chineasePhrase = "we're just getting started 操你妈逼";
        const englishPhrase = "we're just getting started mfer";
        const spanishPhrase = "we're just getting started hijo de tu puta madre";

        if (authorIdQueue.length > 0) {
            const currentTweetObj = authorIdQueue.shift();
            let mferPhrase;
            if (currentTweetObj.isChinease){
              mferPhrase = chineasePhrase
            } else if (currentTweetObj.isSpanish) {
              mferPhrase = spanishPhrase;
            } else {
              mferPhrase = englishPhrase;
            }

            await userClient.v1.reply(
              `${mferPhrase}`,
              currentTweetObj.tweetId
            );
        }
        
        await new Promise((r) => setTimeout(r, 20000));
  }
}

function addTweetId(tweetId) {
  authorIdQueue.push(tweetId);
}


worker.on("message", (msg) => {
  console.log("message recieved")
  addTweetId(msg);
});

sendTweet();

