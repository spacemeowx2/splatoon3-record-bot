import { createWorker, OEM } from "tesseract.js";
import { cv } from 'opencv-wasm';
import { readFile } from 'fs/promises'
import Jimp from 'jimp'

const worker = await createWorker('chi_sim', OEM.DEFAULT, {
  langPath: "./data/",
  cachePath: "./cache/",
  logger: (m: unknown) => console.log(m),
});

await worker.load();

async function getCenterMessage(buffer: Buffer) {
  const img = await Jimp.create(buffer);
  const centerImg = await img
    .resize(1280, 720)
    .crop(400, 300, 400, 120)
    .getBufferAsync(Jimp.MIME_JPEG);

  const { data } = await worker.recognize(centerImg);

  return data.text;
}

const img = await readFile("./testimg/IMG_4622.JPG");

console.log(await getCenterMessage(img));

await worker.terminate();
