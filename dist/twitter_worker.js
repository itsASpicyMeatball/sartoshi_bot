var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { auth } from "./config/config.js";
import { findId, saveId } from "./database_queries.js";
const client = auth();
import { parentPort } from "worker_threads";
const PHRASES = ["hop in mfer", "mfer", "mfers", "chinga tu madre", "操你妈逼"];
function listenOnStream() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const rules = yield client.v2.streamRules();
        if ((_a = rules.data) === null || _a === void 0 ? void 0 : _a.length) {
            yield client.v2.updateStreamRules({
                delete: { ids: rules.data.map((rule) => rule.id) },
            });
        }
        // Add our rules
        const streamRuleObjs = PHRASES.map((phrase) => {
            return { value: phrase };
        });
        yield client.v2.updateStreamRules({
            add: streamRuleObjs,
        });
        const stream = yield client.v2.searchStream({
            "tweet.fields": ["referenced_tweets", "author_id"],
            expansions: ["referenced_tweets.id"],
        });
        // Enable auto reconnect
        stream.autoReconnect = true;
        stream.on("data event content", (tweet) => __awaiter(this, void 0, void 0, function* () {
            // Ignore RTs or self-sent tweets
            const optInText = "hop in mfer";
            const author_id = parseInt(tweet.data.author_id);
            const botId = 1543791826729058300;
            const idFound = yield findId(author_id);
            const text = tweet.data.text.toLowerCase();
            const isChinease = text.includes("操你妈逼") ? true : false;
            const isSpanish = text.includes("chinga tu madre") ? true : false;
            const tweetId = tweet.data.id;
            if (text === optInText && !idFound) {
                console.log(tweet);
                yield saveId(author_id);
            }
            else if (idFound &&
                author_id != botId &&
                (text.includes("mfer") ||
                    text.includes("mfers") ||
                    text.includes("操你妈逼") ||
                    text.includes("chinga tu madre"))) {
                console.log(tweet);
                parentPort.postMessage({
                    tweetId: tweetId,
                    isChinease: isChinease,
                    isSpanish: isSpanish,
                });
            }
            // Reply to tweet
        }));
    });
}
listenOnStream();
