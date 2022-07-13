import { userClientAuth } from "./config/config.js";
import { Worker } from "worker_threads";
import { maskify } from "./layer.js";
const worker = new Worker("./dist/twitter_worker.js");
const userClient = userClientAuth();

const authorIdQueue: any[] = [];

function returnPhrase(currentTweetObj:any) {
  
  let mferPhrase = "we're just getting started mfer";
  if (currentTweetObj.isChinease) {
    mferPhrase = currentTweetObj.isChinease;
  } else if (currentTweetObj.isSpanish) {
    mferPhrase = currentTweetObj.isSpanish;
  } else if (currentTweetObj.smilesssfy) {
    mferPhrase = currentTweetObj.smilesssfy;
  }
  
  return mferPhrase;
}

//example mferfying, smilesssfying
async function sendFyingTweet(currentTweetObj:any, mferPhrase:any) {
  let smilesssOrMfer = 0;
  if (currentTweetObj.smilesssfy) {
    smilesssOrMfer = 1;
  }
  const mergedImageBuffer = await maskify(
    currentTweetObj.imageBuffer,
    currentTweetObj.imageUrl,
    smilesssOrMfer
  );
  if (mergedImageBuffer === -1) {
    await userClient.v1.reply(
      `There was an issue fying your image`,
      currentTweetObj.tweetId
    );
  } else {
    const mediaIds = await userClient.v1.uploadMedia(mergedImageBuffer, {
      mimeType: "png",
    });
    await userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId, {
      media_ids: mediaIds,
    });
  }
}

async function sendTweet() {
  while (true) {
    console.log(authorIdQueue);

    if (authorIdQueue.length > 0) {
      const currentTweetObj: any = authorIdQueue.shift();
      let mferPhrase = returnPhrase(currentTweetObj);
      if (
        currentTweetObj.imageBuffer &&
        (currentTweetObj.mferfy || currentTweetObj.smilesssfy)
      ) {
        await sendFyingTweet(currentTweetObj, mferPhrase);
      } else {
        await userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId);
      }
    }

    await new Promise((r) => setTimeout(r, 20000));
  }
}

function addTweetId(tweetId: any) {
  authorIdQueue.push(tweetId);
}

worker.on("message", (msg) => {
  console.log("message recieved");
  addTweetId(msg);
});

sendTweet();
