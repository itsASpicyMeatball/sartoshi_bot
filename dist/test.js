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
const getRandomMferBuffer = (masks) => __awaiter(void 0, void 0, void 0, function* () {
    const img = yield canvas.loadImage("./images/chicken2.png");
    return "./images/chicken2.png";
});
const rotateImage = (buffer, angle) => __awaiter(void 0, void 0, void 0, function* () {
    const rotatedImage = yield sharp(buffer).rotate(angle).png().toFile("./images/out.png");
    return rotatedImage;
});
export function maskify(masks) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Maskify starting...");
        yield faceDetectionNet.loadFromDisk("./weights");
        yield Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromDisk("./weights"),
            faceapi.nets.faceLandmark68TinyNet.loadFromDisk("./weights"),
        ]).catch((error) => {
            console.error(error);
        });
        const img = yield canvas.loadImage("./images/family_picture_ideas_on_the_beach.jpeg");
        const imageBuffer = yield fsp.readFile("./images/family_picture_ideas_on_the_beach.jpeg");
        const scale = img.width / img.naturalWidth;
        const detections = yield faceapi.detectAllFaces(img, getFaceDetectorOptions(faceDetectionNet)).withFaceLandmarks(true);
        for (let i = 0; i < detections.length; i++) {
            const detection = detections[0];
            const values = getOverlayValues(detection.landmarks);
            console.log(yield rotateImage(imageBuffer, values.angle));
            break;
        }
        console.log("models loaded");
    });
}
maskify([]);
