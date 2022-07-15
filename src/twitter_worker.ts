import { auth } from "./config/config.js";
import { findId, saveId } from "./database_queries.js";
import fetch from "node-fetch";

const client = auth();

import { parentPort } from "worker_threads";

const PHRASES = [
  "hop in mfer",
  "mfer",
  "mfers",
  "chinga tu madre",
  "操你妈逼",
  "mferfy",
  "smilesssfy",
];

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
      const author_id = parseInt(tweet.data.author_id);
      const botId = 1543791826729058300;
      const idFound = await findId(author_id);
      const text = tweet.data.text.toLowerCase();
      const isChinease = text.includes("操你妈逼")
        ? "we're just getting started 操你妈逼"
        : false;
      const isSpanish = text.includes("chinga tu madre")
        ? "we're just getting started hijo de tu puta madre"
        : false;
      const tweetId = tweet.data.id;
      const mediaArr = tweet.includes ? tweet.includes.media : [];
  
      if (text === optInText && !idFound) {
        console.log(tweet);
        await saveId(author_id);
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
        let mferfy = text.includes("mferfy");
        let smilesssfy = text.includes("smilesssfy")
          ? "we're just getting started fam"
          : false;
        let imageBuffer;
        let imageUrl;
        if (mediaArr) {
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
        }
  
        parentPort!.postMessage({
          tweetId: tweetId,
          isChinease: isChinease,
          isSpanish: isSpanish,
          imageBuffer: imageBuffer,
          imageUrl: imageUrl,
          mferfy,
          smilesssfy,
        });
        
      }
    } catch (error) {
      console.log(error)
    }
  });
}

listenOnStream();
