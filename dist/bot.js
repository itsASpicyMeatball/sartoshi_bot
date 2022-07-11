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
const worker = new Worker("./dist/twitter_worker.js");
const userClient = userClientAuth();
const authorIdQueue = [];
function sendTweet() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            console.log(authorIdQueue);
            const chineasePhrase = "we're just getting started 操你妈逼";
            const englishPhrase = "we're just getting started mfer";
            const spanishPhrase = "we're just getting started hijo de tu puta madre";
            if (authorIdQueue.length > 0) {
                const currentTweetObj = authorIdQueue.shift();
                let mferPhrase;
                if (currentTweetObj.isChinease) {
                    mferPhrase = chineasePhrase;
                }
                else if (currentTweetObj.isSpanish) {
                    mferPhrase = spanishPhrase;
                }
                else {
                    mferPhrase = englishPhrase;
                }
                yield userClient.v1.reply(`${mferPhrase}`, currentTweetObj.tweetId);
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
