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
function createImageBuffer(mediaArr) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageBuffer;
        let imageUrl;
        for (let i = 0; i < mediaArr.length; i++) {
            console.log(mediaArr);
            const mediaUrl = mediaArr[i].url;
            const imageResponse = yield fetch(mediaUrl);
            const imageArrBuffer = yield imageResponse.arrayBuffer();
            const buffer = Buffer.from(imageArrBuffer);
            imageBuffer = buffer;
            imageUrl = mediaArr[i].url;
            break;
        }
        return { imageBuffer, imageUrl };
    });
}
function fetchTweet(tweetId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.v2.get("tweets", {
            ids: tweetId,
            expansions: ["referenced_tweets.id", "attachments.media_keys"],
            "media.fields": ["url"],
        });
    });
}
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
            expansions: ["referenced_tweets.id", "attachments.media_keys"],
            "media.fields": ["url"],
        });
        // Enable auto reconnect
        stream.autoReconnect = true;
        stream.on("data event content", (tweet) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            try {
                const optInText = "hop in mfer";
                const author_id = parseInt(tweet.data.author_id);
                const botId = 1543791826729058300;
                const idFound = yield findId(author_id);
                const text = tweet.data.text.toLowerCase();
                const repliedToTweets = (_b = tweet === null || tweet === void 0 ? void 0 : tweet.includes) === null || _b === void 0 ? void 0 : _b.tweets;
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
                    yield saveId(author_id);
                }
                else if (idFound &&
                    author_id != botId &&
                    (text.includes("mfer") ||
                        text.includes("mfers") ||
                        text.includes("操你妈逼") ||
                        text.includes("chinga tu madre") ||
                        text.includes("mferfy") ||
                        text.includes("smilesssfy"))) {
                    console.log(tweet);
                    let mferfy = text.includes("mferfy");
                    let smilesssfy = text.includes("smilesssfy")
                        ? "we're just getting started fam"
                        : false;
                    let imageBuffer;
                    let imageUrl;
                    let bufferObject;
                    if (mediaArr) {
                        bufferObject = yield createImageBuffer(mediaArr);
                    }
                    else if (repliedToTweets) {
                        const repliedToTweetsWithMedia = yield fetchTweet(repliedToTweets[0].id);
                        console.log(repliedToTweetsWithMedia);
                        const media = (_c = repliedToTweetsWithMedia === null || repliedToTweetsWithMedia === void 0 ? void 0 : repliedToTweetsWithMedia.includes) === null || _c === void 0 ? void 0 : _c.media;
                        bufferObject = media ? yield createImageBuffer(media) : {};
                    }
                    parentPort.postMessage({
                        tweetId: tweetId,
                        isChinease: isChinease,
                        isSpanish: isSpanish,
                        imageBuffer: bufferObject === null || bufferObject === void 0 ? void 0 : bufferObject.imageBuffer,
                        imageUrl: bufferObject === null || bufferObject === void 0 ? void 0 : bufferObject.imageUrl,
                        mferfy,
                        smilesssfy,
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        }));
    });
}
listenOnStream();
