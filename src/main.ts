import { createWorker } from "tesseract.js";
import { cv } from 'opencv-wasm';
import { readFile } from 'fs/promises'
import Jimp from 'jimp'

const img = await readFile("./testimg/S3.jpg");
const jimpSrc = await Jimp.read("./testimg/IMG_4622.JPG")
const mat = cv.matFromImageData(jimpSrc.bitmap)
console.log(mat.cols, mat.rows)

const worker = await createWorker({
    langPath: "./data/",
    cachePath: "./cache/",
    logger: (m: unknown) => console.log(m),
});

await worker.load();
await worker.loadLanguage("chi_sim");
await worker.initialize("chi_sim");

const { data } = await worker.recognize(img);
console.log(data.text);
await worker.terminate();
