import { auth } from "./config/config.js";
import fetch from "node-fetch";

const client = auth();

import { parentPort } from "worker_threads";

const PHRASES = ["hop in mfer", "hop out mfer", "gm mfer", "gmfer", "mferfy", "savemfergif"];
let timeout = 0;

function returnPhrase(currentTweetObj: any) {
  let mferPhrase = "we're just getting started mfer";
  if (currentTweetObj.isGmMfer) {
    return currentTweetObj.isGmMfer;
  } else if (currentTweetObj.isWelcome) {
    return currentTweetObj.isWelcome;
  } else if (currentTweetObj.isGoodBye) {
    return currentTweetObj.isGoodBye;
  } else if (currentTweetObj.isChinease) {
    return currentTweetObj.isChinease;
  } else if (currentTweetObj.isSpanish) {
    return currentTweetObj.isSpanish;
  } else if (currentTweetObj.smilesssfy) {
    return currentTweetObj.smilesssfy;
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

  return { imageBuffer, imageUrl };
}

async function fetchTweet(tweetId: any) {
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
    "tweet.fields": ["referenced_tweets", "author_id", "attachments"],
    expansions: ["referenced_tweets.id", "attachments.media_keys"],
    "media.fields": ["url", "media_key", "type"],
  });

  // Enable auto reconnect
  stream.autoReconnect = true;

  stream
    .on("data event content", async (tweet: any) => {
      try {
        const optInText = "hop in mfer";
        const optOutText = "hop out mfer";
        const author_id = parseInt(tweet.data.author_id);
        const botId = 1543791826729058300;
        const text = tweet.data.text.toLowerCase();
        const repliedToTweets = tweet?.includes?.tweets;
        // const isChinease = text.includes("操你妈逼")
        //   ? "we're just getting started 操你妈逼"
        //   : false;
        // const isSpanish = text.includes("chinga tu madre")
        //   ? "we're just getting started hijo de tu puta madre"
        //   : false;
        // const isEnglish = "we're just getting started mfer";
        const isWelcome = text.includes(optInText) ? "welcome mfer" : false;
        const isGoodBye = text.includes(optOutText) ? "bye mfer" : false;
        const isGmMfer =
          text.includes("gm mfer") || text.includes("gmfer")
            ? `gm mfer`
            : false;

        const phraseObject = {
          isWelcome,
          isGoodBye,
          isGmMfer,
        };

        let finalPhrase = returnPhrase(phraseObject);
        if (isGmMfer) {
          const resp = await fetch("https://type.fit/api/quotes");
          const quotes = await resp.json();
          // @ts-ignore
          const randomQuoteObj = quotes[Math.floor(Math.random() * (quotes.length - 1))];
          const quoteTxt = randomQuoteObj.text;
          finalPhrase = `gm gm gm, ${quoteTxt}`;
        }
        let mferfy = text.includes("mferfy");
        let saveGif = text.includes("savemfergif");
        let smilesssfy = text.includes("smilesssfy")
          ? "we're just getting started fam"
          : false;
        let imageBuffer;
        let imageUrl;
        //if mferfy is in the statement then go ahead and let them mferfy. they don't have to me in the database
        let replyGate = mferfy || saveGif || isGmMfer;
        const tweetId = tweet?.data?.id;
        console.log("banana")
        console.log(tweet.data.referenced_tweet)
        const referenced_tweets = tweet?.data?.referenced_tweets;
        const referenced_tweet_id = referenced_tweets
          ? referenced_tweets[0].id
          : false;
        const referenced_tweet = referenced_tweet_id ? await fetchTweet(referenced_tweet_id) : false;
        let mediaArr = referenced_tweet?.includes?.media || []
        if (tweet?.includes?.media) {
          mediaArr = tweet?.includes?.media
        } else if (referenced_tweet?.includes?.media) {
          mediaArr = referenced_tweet?.includes?.media;
        } else {
          mediaArr = []
        }

        const messageObject = {
          tweetId,
          finalPhrase,
          imageBuffer,
          imageUrl,
          mferfy,
          smilesssfy,
          saveGif,
        };

        if (replyGate && author_id != botId) {
          console.log(tweet);
          let bufferObject;
          // @ts-ignore
          if (mediaArr && !saveGif) {
            // @ts-ignore
            bufferObject = await createImageBuffer(mediaArr);
          } else if (repliedToTweets && !saveGif) {
            const repliedToTweetsWithMedia = await fetchTweet(
              repliedToTweets[0].id
            );
            const media = repliedToTweetsWithMedia?.includes?.media;
            bufferObject = media ? await createImageBuffer(media) : {};
          }

          messageObject.imageBuffer = bufferObject?.imageBuffer as any;
          messageObject.imageUrl = bufferObject?.imageUrl;
          parentPort!.postMessage(messageObject);
        }
      } catch (error) {
        console.log(error);
      }
    })
    .on("error", (error) => {
      // Connection timed out
      console.log("error", error);
      reconnect(stream);
    });
}

const sleep = async (delay: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), delay));
};

const reconnect = async (stream: any) => {
  timeout++;
  stream.abort();
  await sleep(2 ** timeout * 1000);
  listenOnStream();
};

listenOnStream();
