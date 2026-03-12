import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

const SIZE_THRESHOLD = 50 * 1024 * 1024; // 50 MB

/**
 * Compress a video file using FFmpeg WASM.
 *
 * - Skips compression when the file is already under 50 MB.
 * - Targets H.264 + AAC, max 720p, ~1.5 Mbps video bitrate.
 * - Falls back to returning the original file if FFmpeg fails to load.
 */
export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<File> {
  if (file.size < SIZE_THRESHOLD) {
    onProgress?.(100);
    return file;
  }

  let ffmpeg: FFmpeg | null = null;

  try {
    ffmpeg = new FFmpeg();

    // Report encoding progress
    ffmpeg.on("progress", ({ progress }) => {
      // progress is 0‑1 from FFmpeg; clamp to 0‑99 so 100 means "done"
      onProgress?.(Math.min(Math.round(progress * 100), 99));
    });

    // Load the FFmpeg core from the CDN (multi‑threaded not required)
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    const inputName = "input" + getExtension(file.name);
    const outputName = "output.mp4";

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    await ffmpeg.exec([
      "-i",
      inputName,
      // Video: H.264, max 720p, ~1.5 Mbps
      "-vf",
      "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-b:v",
      "1500k",
      "-maxrate",
      "2000k",
      "-bufsize",
      "3000k",
      // Audio: AAC 128 kbps
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      // Misc
      "-movflags",
      "+faststart",
      "-y",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);

    // data may come back as Uint8Array or string
    const blob = new Blob([data], { type: "video/mp4" });

    // Build a human‑friendly file name
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const compressed = new File([blob], `${baseName}_compressed.mp4`, {
      type: "video/mp4",
    });

    onProgress?.(100);
    return compressed;
  } catch (err) {
    console.warn(
      "[video-compress] FFmpeg failed – uploading original file.",
      err,
    );
    onProgress?.(100);
    return file;
  } finally {
    try {
      ffmpeg?.terminate();
    } catch {
      // ignore
    }
  }
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}
