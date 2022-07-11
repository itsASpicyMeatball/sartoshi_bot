const fs = require("fs");
const Promise = require("bluebird");
const { auth } = require("../config/config.js");
const { findId, saveId } = require("./src/database_queries.ts");
const client = auth();

const { parentPort } = require("worker_threads");
PHRASES = ["hop in mfer", "mfer", "mfers", "chinga tu madre", "操你妈逼"];
async function listenOnStream() {
  const rules = await client.v2.streamRules();
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    });
  }

  // Add our rules
  const streamRuleObjs = PHRASES.map((phrase) =>  {
    return {value: phrase}
  })

  await client.v2.updateStreamRules({
    add: streamRuleObjs,
  });

  const stream = await client.v2.searchStream({
    "tweet.fields": ["referenced_tweets", "author_id"],
    expansions: ["referenced_tweets.id"],
  });
  // Enable auto reconnect
  stream.autoReconnect = true;

  stream.on("data event content", async (tweet) => {
    // Ignore RTs or self-sent tweets
    const optInText = "hop in mfer";
    const author_id = parseInt(tweet.data.author_id);
    const botId = 1543791826729058300;
    const idFound = await findId(author_id);
    const text = tweet.data.text.toLowerCase();
    const isChinease = text.includes("操你妈逼") ? true : false;
    const isSpanish = text.includes("chinga tu madre") ? true : false;

    const tweetId = tweet.data.id;
    if (text === optInText && !idFound) {
      console.log(tweet);
      await saveId(author_id);
    } else if (
      idFound &&
      author_id != botId &&
      (text.includes("mfer") ||
        text.includes("mfers") ||
        text.includes("操你妈逼") ||
        text.includes("chinga tu madre"))
    ) {
      console.log(tweet);
      parentPort.postMessage({
        tweetId: tweetId,
        isChinease: isChinease,
        isSpanish: isSpanish,
      });
    }

    // Reply to tweet
  });
}

listenOnStream();
