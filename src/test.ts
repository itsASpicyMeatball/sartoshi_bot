import fetch from "node-fetch";
import fs from "fs";
const imageUrls = fs.createWriteStream("./mfers.txt");

async function fetchMferHead(id: number) {
  const mferApiFormat = `https://gateway.pinata.cloud/ipfs/QmWiQE65tmpYzcokCheQmng2DCM33DEhjXcPB6PanwpAZo/${id}`;

  const response = await fetch(mferApiFormat);
  const jsonResponse = await response.json()
  console.log(jsonResponse)
  // @ts-ignore: Unreachable code error
  const imageipfs = await jsonResponse.image.split("//")[1];

  return `https://gateway.pinata.cloud/ipfs/${imageipfs}`;
}

async function iterateThroughIds() {
    let i = 0;

    while (i < 10022) {
        const url = await fetchMferHead(i);
        imageUrls.write(`${url}\n`)
        await new Promise((r) => setTimeout(r, 2000));
        i += 1 
    }
}


iterateThroughIds()