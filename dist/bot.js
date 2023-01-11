var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { userClientAuth } from "./config/config.js";
import { Worker } from "worker_threads";
import { maskify } from "./layer.js";
const worker = new Worker("./dist/twitter_worker.js");
const userClient = userClientAuth();
const authorIdQueue = [];
//example mferfying, smilesssfying
function sendFyingTweet(currentTweetObj, mferPhrase) {
    return __awaiter(this, void 0, void 0, function* () {
        let smilesssOrMfer = 0;
        if (currentTweetObj.smilesssfy) {
            smilesssOrMfer = 1;
        }
        const mergedImageBuffer = yield maskify(currentTweetObj.imageBuffer, currentTweetObj.imageUrl, smilesssOrMfer);
        if (mergedImageBuffer === -1) {
            yield userClient.v1.reply(`There was an issue fying your image`, currentTweetObj.tweetId);
        }
        else {
            const mediaIds = yield userClient.v1.uploadMedia(mergedImageBuffer, {
                mimeType: "png",
            });
            yield userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId, {
                media_ids: mediaIds,
            });
        }
    });
}
function sendTweet() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            try {
                if (authorIdQueue.length > 0) {
                    const currentTweetObj = authorIdQueue.shift();
                    console.log(currentTweetObj);
                    let mferPhrase = currentTweetObj.finalPhrase;
                    if (currentTweetObj.imageBuffer &&
                        (currentTweetObj.mferfy || currentTweetObj.smilesssfy)
                        && !currentTweetObj.saveGif) {
                        yield sendFyingTweet(currentTweetObj, mferPhrase);
                    }
                    else if (currentTweetObj.saveGif) {
                        yield userClient.v2.retweet("1543791826729058304", currentTweetObj.tweetId);
                    }
                    else {
                        yield userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
            yield new Promise((r) => setTimeout(r, 20000));
        }
    });
}
function addTweetId(tweetId) {
    authorIdQueue.push(tweetId);
}
worker.on("message", (msg) => {
    console.log("message recieved");
    addTweetId(msg);
});
sendTweet();
