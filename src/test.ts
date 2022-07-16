import fetch from "node-fetch";

async function fetchMferHead(id: number) {
    const mferApiFormat = `${id}.png`

    const response = await fetch(`https://heads.mfers.dev/${mferApiFormat}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}

fetchMferHead(0)