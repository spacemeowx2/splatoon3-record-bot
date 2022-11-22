import { createWorker } from "./tesseract.ts";

const img = Deno.readFileSync("./testimg/S3.jpg");

const worker = await createWorker({
  corePath:
    "https://unpkg.zhimg.com/tesseract.js-core@v2.0.0/tesseract-core.wasm.js",
  langPath: "./data/",
  cachePath: "./cache/",
  logger: (m: unknown) => console.log(m),
});

(async () => {
  await worker.load();
  await worker.loadLanguage("chi_sim");
  await worker.initialize("chi_sim");

  const { data } = await worker.recognize(img);
  console.log(data);
  console.log(data.text);
  await worker.terminate();
})();
