import { auth } from "./config/config.js";
import { findId, saveId, deleteId } from "./database_queries.js";
import fetch from "node-fetch";

const client = auth();

import { parentPort } from "worker_threads";

const PHRASES = [
  "hop in mfer",
  "hop out mfer",
  "mfer",
  "mfers",
  "chinga tu madre",
  "操你妈逼",
  "mferfy",
  "smilesssfy",
];

function returnPhrase(currentTweetObj: any) {
  let mferPhrase = "we're just getting started mfer";
  if (currentTweetObj.isChinease) {
    return currentTweetObj.isChinease;
  } else if (currentTweetObj.isSpanish) {
    return currentTweetObj.isSpanish;
  } else if (currentTweetObj.smilesssfy) {
    return currentTweetObj.smilesssfy;
  } else if ( currentTweetObj.isWelcome) {
    return currentTweetObj.isWelcome;
  } else if (currentTweetObj.isGoodBye) {
    return currentTweetObj.isGoodBye;
  }

  return mferPhrase;
}

async function createImageBuffer(mediaArr: any) {
  let imageBuffer;
  let imageUrl;
  for (let i = 0; i < mediaArr.length; i++) {
    console.log(mediaArr);
    const mediaUrl = mediaArr[i].url;
    const imageResponse = await fetch(mediaUrl);
    const imageArrBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageArrBuffer);
    imageBuffer = buffer;
    imageUrl = mediaArr[i].url;
    break;
  }

  return {imageBuffer, imageUrl}
}

async function fetchTweet(tweetId:any) {
  return await client.v2.get("tweets", {
    ids: tweetId,
    expansions: ["referenced_tweets.id", "attachments.media_keys"],
    "media.fields": ["url"],
  });
}

async function listenOnStream() {
  const rules = await client.v2.streamRules();
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule: any) => rule.id) },
    });
  }

  // Add our rules
  const streamRuleObjs = PHRASES.map((phrase) => {
    return { value: phrase };
  });

  await client.v2.updateStreamRules({
    add: streamRuleObjs,
  });

  const stream = await client.v2.searchStream({
    "tweet.fields": ["referenced_tweets", "author_id"],
    expansions: ["referenced_tweets.id", "attachments.media_keys"],
    "media.fields": ["url"],
  });

  // Enable auto reconnect
  stream.autoReconnect = true;

  stream.on("data event content", async (tweet: any) => {
    try {
      const optInText = "hop in mfer";
      const optOutText = "hop out mfer";
      const author_id = parseInt(tweet.data.author_id);
      const botId = 1543791826729058300;
      const idFound = await findId(author_id);
      const text = tweet.data.text.toLowerCase();
      const repliedToTweets = tweet?.includes?.tweets;
      const isChinease = text.includes("操你妈逼")
        ? "we're just getting started 操你妈逼"
        : false;
      const isSpanish = text.includes("chinga tu madre")
        ? "we're just getting started hijo de tu puta madre"
        : false;
      const isEnglish = "we're just getting started mfer";
      const isWelcome = text === optInText ? "welcome mfer" : false;
      const isGoodBye = text === optOutText ? "bye mfer" : false;

      const phraseObject = {isChinease, isEnglish, isSpanish, isWelcome, isGoodBye};

      const finalPhrase = returnPhrase(phraseObject);

      let mferfy = text.includes("mferfy");
      let smilesssfy = text.includes("smilesssfy")
        ? "we're just getting started fam"
        : false;
      let imageBuffer;
      let imageUrl;

      const tweetId = tweet.data.id;
      const mediaArr = tweet.includes ? tweet.includes.media : [];

      const messageObject = {
        tweetId,
        finalPhrase,
        imageBuffer,
        imageUrl,
        mferfy,
        smilesssfy
      };
  
      if (text.includes(optInText) && !idFound) {
        console.log(tweet);
        parentPort!.postMessage(messageObject);
        await saveId(author_id);
      } else if (text.includes(optOutText) && idFound) {
        console.log(tweet);
        await deleteId(author_id);
        parentPort!.postMessage(messageObject);
      } else if (
        idFound &&
        author_id != botId &&
        (text.includes("mfer") ||
          text.includes("mfers") ||
          text.includes("操你妈逼") ||
          text.includes("chinga tu madre") ||
          text.includes("mferfy") ||
          text.includes("smilesssfy"))
      ) {
        console.log(tweet)
        let bufferObject;
        if (mediaArr) {
          bufferObject = await createImageBuffer(mediaArr);
        } else if (repliedToTweets) {
          const repliedToTweetsWithMedia = await fetchTweet(repliedToTweets[0].id)
          const media = repliedToTweetsWithMedia?.includes?.media;
          bufferObject = media ? await createImageBuffer(media) : {};
        } 

        messageObject.imageBuffer = bufferObject?.imageBuffer as any;
        messageObject.imageUrl = bufferObject?.imageUrl;

        parentPort!.postMessage(messageObject);
        
      }
    } catch (error) {
      console.log(error)
    }
  });
}

listenOnStream();
