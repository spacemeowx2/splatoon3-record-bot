import { createWorker, OEM } from 'tesseract.js'
import { cv } from 'opencv-wasm'
import { readFile } from 'fs/promises'
import Jimp from 'jimp'
import { closest } from 'fastest-levenshtein'

const STATE_DICT = {
  '输入的代码目前尚未完成登录，\n请确认持有的代码是否正确。': 0,
  '此对战记忆已下载完成': 1,
}

const worker = await createWorker('chi_sim', OEM.DEFAULT, {
  langPath: './data/',
  cachePath: './cache/',
  logger: (m: unknown) => console.log(m),
})

async function getCenterMessage(buffer: Buffer) {
  const img = await Jimp.create(buffer)
  const centerImg = await img
    .resize(1280, 720)
    .crop(400, 300, 400, 120)
    .getBufferAsync(Jimp.MIME_BMP)

  const { data } = await worker.recognize(centerImg)

  return data.text
}

const img = await readFile('./testimg/IMG_4622.JPG')
const message = await getCenterMessage(img)
const matched = closest(message, Object.keys(STATE_DICT))

console.log(matched, STATE_DICT[matched])

await worker.terminate()