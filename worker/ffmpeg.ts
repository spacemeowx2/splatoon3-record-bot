import { runCommand } from './command';

export async function captureImage(stream: string) {
  const img = await runCommand('ffmpeg', [
    '-i', stream,
    '-vframes', '1',
    '-f', 'image2pipe',
    '-vcodec', 'bmp',
    '-',
  ])
  return img
}
