/**
 * Modify from: https://github.com/ffmpegwasm/ffmpeg.wasm/issues/110#issuecomment-1254214533
 */

import { createWorker as tesseractCreateWorker } from "https://esm.sh/tesseract.js@3.0.3";

const VERSION = "3.0.3";
const CORE_VERSION = "3.0.2";

// @ts-ignore tesseract uses `instantof HTMLElement`
globalThis.HTMLElement = class HTMLElement { };

type AsyncCallback = (...args: unknown[]) => Promise<unknown>;
function async2request<F extends AsyncCallback>(func: F) {
  return (...args: Parameters<F>) => {
    const request: {
      onsuccess?: () => void;
      onerror?: () => void;
      result?: Awaited<F>;
      error?: unknown;
    } = {};
    func(...args).then((r) => {
      request.result = r as Awaited<F>;
      request.onsuccess?.();
    }).catch((e) => {
      request.error = e;
      request.onerror?.();
    });
    return request;
  };
}

async function createWorker(options?: Partial<Tesseract.WorkerOptions>) {
  const cachePath = options?.cachePath ?? "./cache";
  const workerContent = await (await fetch(
    `https://unpkg.com/tesseract.js@${VERSION}/dist/worker.min.js`,
  )).text();
  const wasmJs = await (await fetch(
    `https://unpkg.com/tesseract.js-core@${CORE_VERSION}/tesseract-core.wasm.js`,
  )).text();

  function replaceWorkerScript(data: string) {
    let newData = data;

    // modify importscripts to work with deno
    // newData = newData.replace(/importScripts\(/gi, "self.importScripts(");

    // import scripts replacement
    newData = newData + `
    self.importScripts = () => {
        ${wasmJs}
        self.TesseractCoreWASM = TesseractCoreWASM
    };
    ${async2request.toString()};
    self.indexedDB = {
      open: async2request(async () => {
        return {
          transaction() {
            const t = {
              objectStore: () => ({
                get(key) {
                  const req = {};
                  Deno.readFile(key)
                    .then(u8 => {
                      req.result = u8;
                      t.oncomplete?.();
                    })
                    .catch(e => {
                      req.error = e;
                      t.onabort?.();
                    })
                  return req
                },
                put(data, key) {
                  const req = {};
                  Deno.writeFile(key, data)
                    .then(() => t.oncomplete?.())
                    .catch(e => {
                      console.error('write error', e)
                      req.error = e;
                      t.onabort?.();
                    })
                  return req
                }
              })
            }
            return t
          }
        }
      })
    }
    `;

    return newData;
  }

  // worker shim for Deno worker compatibility
  const DenoWorker = Worker;
  // @ts-ignore global worker override
  self.Worker = function Worker() {
    const newContent = replaceWorkerScript(workerContent);
    Deno.writeTextFileSync('debug.js', newContent)
    const blob = new Blob([newContent], { type: "text/javascript" });
    // TODO: may leak here
    const blobUrl = URL.createObjectURL(blob);
    const worker = new DenoWorker(blobUrl, {
      type: "module",
    });
    return worker;
  };

  // @ts-ignore tesseract shim here
  const oldDocument = window.document;
  // @ts-ignore tesseract shim here
  window.document = {
    handler: null,
    createElement: (_e: unknown) => {
      return {
        src: "",
      };
    },
  };

  const worker = tesseractCreateWorker(options);

  // @ts-ignore tesseract shim here
  window.document = oldDocument;
  // @ts-ignore global worker override
  self.Worker = DenoWorker;

  return worker;
}

export { createWorker };
