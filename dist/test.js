var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}
const getOverlayValues = (landmarks) => {
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
    const width = jawLength * 2.2;
    return {
        width,
        angle,
        leftOffset: jawLeft.x - width * 0.27,
        topOffset: nose[0].y - width * 0.47,
    };
};
const getRandomMferBuffer = () => __awaiter(void 0, void 0, void 0, function* () {
    const imageBuffer = yield fsp.readFile("./images/mfer.png");
    return imageBuffer;
});
const rotateImage = (buffer, angle) => __awaiter(void 0, void 0, void 0, function* () {
    const rotatedImage = yield sharp(buffer)
        .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
    return rotatedImage;
});
const mergeImages = (base, layer, offsetleft, offsetTop) => __awaiter(void 0, void 0, void 0, function* () {
    const layeredImage = yield sharp(base)
        .composite([{ input: layer, left: offsetleft, top: offsetTop }])
        .png()
        .toBuffer();
    return layeredImage;
});
const outputFile = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    yield sharp(buffer).png().toFile("./images/out.png");
});
const scaleMfer = (imgBuffer, width) => __awaiter(void 0, void 0, void 0, function* () {
    const scaledMfer = yield sharp(imgBuffer).resize({ width: width }).toBuffer();
    return scaledMfer;
});
export function maskify(masks) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Maskify starting...");
        yield faceDetectionNet.loadFromDisk("./weights");
        yield faceapi.nets.faceLandmark68Net.loadFromDisk("./weights");
        // await Promise.all([
        //   faceapi.nets.tinyFaceDetector.loadFromDisk("./weights"),
        //   faceapi.nets.faceLandmark68TinyNet.loadFromDisk("./weights"),
        // ]).catch((error) => {
        //   console.error(error);
        // }); 
        const img = (yield canvas.loadImage("./images/kpop8.jpeg"));
        let imageBuffer = yield fsp.readFile("./images/kpop8.jpeg");
        const scale = img.width / img.naturalWidth;
        const detections = yield faceapi
            .detectAllFaces(img, getFaceDetectorOptions(faceDetectionNet))
            .withFaceLandmarks();
        for (let i = 0; i < detections.length; i++) {
            const detection = detections[i];
            const values = getOverlayValues(detection.landmarks);
            console.log(values);
            const rotatedMfer = yield rotateImage(yield getRandomMferBuffer(), values.angle);
            const scaledMfer = yield scaleMfer(rotatedMfer, Math.floor(values.width));
            console.log("banana");
            // @ts-ignore: Unreachable code error
            imageBuffer = yield mergeImages(imageBuffer, scaledMfer, Math.floor(values.leftOffset * scale), Math.floor(values.topOffset * scale));
        }
        yield outputFile(imageBuffer);
        console.log("models loaded");
    });
}
maskify([]);
