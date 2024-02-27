import { createWorker, OEM } from "tesseract.js";
import { cv } from 'opencv-wasm';
import { readFile } from 'fs/promises'
import Jimp from 'jimp'

const img = await readFile("./testimg/S3.jpg");

const worker = await createWorker('chi_sim', OEM.DEFAULT, {
    langPath: "./data/",
    cachePath: "./cache/",
    logger: (m: unknown) => console.log(m),
});

await worker.load();

const { data } = await worker.recognize(img);
console.log(data.text);
await worker.terminate();
