// import "@tensorflow/tfjs-node";
import * as faceapi from "face-api.js";
import canvas from "canvas";
import sharp from "sharp";
import { promises as fsp } from "fs";
export const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
const { Canvas, Image, ImageData } = canvas;
// @ts-ignore: Unreachable code error
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 408;
const scoreThreshold = 0.5;

function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>) {
  return net === faceapi.nets.ssdMobilenetv1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

const getOverlayValues = (landmarks: any) => {
  const nose = landmarks.getNose();
  const jawline = landmarks.getJawOutline();

  const jawLeft = jawline[0];
  const jawRight = jawline.splice(-1)[0];
  const adjacent = jawRight.x - jawLeft.x;
  const opposite = jawRight.y - jawLeft.y;
  const jawLength = Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));

  // Both of these work. The chat believes atan2 is better.
  // I don't know why. (It doesn’t break if we divide by zero.)
  // const angle = Math.round(Math.tan(opposite / adjacent) * 100)
  const angle = Math.atan2(opposite, adjacent) * (180 / Math.PI);
  const width = jawLength * 3.2;

  return {
    width,
    angle,
    leftOffset: jawLeft.x - width * 0.27,
    topOffset: nose[0].y - width * 0.47,
  };
};

const getRandomMferBuffer = async () => {
  const imageBuffer = await fsp.readFile(
    "./images/mfer.png"
  );
  return imageBuffer;
};

const rotateImage = async (buffer: any, angle: any) => {
  const rotatedImage = await sharp(buffer)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return rotatedImage;
};

const mergeImages = async (
  base: any,
  layer: any,
  offsetleft: any,
  offsetTop: any
) => {
  const layeredImage = await sharp(base)
    .composite([{ input: layer, left: offsetleft, top: offsetTop}])
    .png()
    .toBuffer();

  return layeredImage;
};

const outputFile = async (buffer:any) => {
  return await sharp(buffer).png().toBuffer();
}

const scaleMfer = async (imgBuffer:  any, width: number) => {
  const scaledMfer = await sharp(imgBuffer).resize({width: width}).toBuffer();

  return scaledMfer;
}

export async function maskify(buffer: any, imageUrl: any){
  try {
    console.log("Maskify starting...");
    await faceDetectionNet.loadFromDisk("./weights");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./weights");
    await faceapi.nets.tinyFaceDetector.loadFromDisk("./weights");
    console.log("banana")
    const img = (await canvas.loadImage(imageUrl)) as any;
    let imageBuffer = buffer;
  
    const scale = img.width / img.naturalWidth;
    console.log(img);
    const detections = await faceapi
      .detectAllFaces(img, getFaceDetectorOptions(faceDetectionNet))
      .withFaceLandmarks();
  
    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      const values = getOverlayValues(detection.landmarks);
      console.log(values)
      const rotatedMfer = await rotateImage(
        await getRandomMferBuffer(),
        values.angle
      );
      const scaledMfer = await scaleMfer(rotatedMfer, Math.floor(values.width));
      // @ts-ignore: Unreachable code error
      imageBuffer = await mergeImages(
        imageBuffer,
        scaledMfer,
        Math.floor(values.leftOffset * scale),
        Math.floor(values.topOffset * scale)
      );
    }
    const finalBuffer = await outputFile(imageBuffer)
    console.log("models loaded");
    return finalBuffer;
  } catch (error) {
    return -1;
  }
}


