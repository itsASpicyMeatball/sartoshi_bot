var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
import fs from "fs";
const imageUrls = fs.createWriteStream("./mfers.txt");
function fetchMferHead(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const mferApiFormat = `https://gateway.pinata.cloud/ipfs/QmWiQE65tmpYzcokCheQmng2DCM33DEhjXcPB6PanwpAZo/${id}`;
        const response = yield fetch(mferApiFormat);
        const jsonResponse = yield response.json();
        console.log(jsonResponse);
        // @ts-ignore: Unreachable code error
        const imageipfs = yield jsonResponse.image.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${imageipfs}`;
    });
}
function iterateThroughIds() {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        while (i < 10022) {
            const url = yield fetchMferHead(i);
            imageUrls.write(`${url}\n`);
            yield new Promise((r) => setTimeout(r, 2000));
            i += 1;
        }
    });
}
iterateThroughIds();
