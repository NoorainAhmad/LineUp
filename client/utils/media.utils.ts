export class MediaUtils {
  /**
   * Mute a video file by removing audio track
   * Returns a new muted video file
   */
  static async muteVideo(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // Create video element to load the file
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        // Create canvas to capture video frames
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Set up MediaRecorder to capture muted video
        const stream = canvas.captureStream(30); // 30 fps
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
          videoBitsPerSecond: 2500000, // 2.5 Mbps
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const mutedBlob = new Blob(chunks, { type: "video/webm" });
          const mutedFile = new File(
            [mutedBlob],
            file.name.replace(/\.[^/.]+$/, "") + "_muted.webm",
            { type: "video/webm" },
          );

          URL.revokeObjectURL(url);
          resolve(mutedFile);
        };

        // Start recording
        mediaRecorder.start();

        // Draw video frames to canvas
        const ctx = canvas.getContext("2d")!;
        const drawFrame = () => {
          if (video.ended) {
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };

        video.play();
        drawFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load video"));
      };
    });
  }

  /**
   * Mute an audio file (completely silence it)
   * Returns a new silent audio file
   */
  static async muteAudio(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create a silent buffer of same duration
          const silentBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate,
          );

          // Fill with silence (zeros)
          for (
            let channel = 0;
            channel < silentBuffer.numberOfChannels;
            channel++
          ) {
            const data = silentBuffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
              data[i] = 0; // Silence
            }
          }

          // Convert back to WAV
          const wavBlob = this.audioBufferToWav(silentBuffer);
          const silentFile = new File(
            [wavBlob],
            file.name.replace(/\.[^/.]+$/, "") + "_silent.wav",
            { type: "audio/wav" },
          );

          await audioContext.close();
          resolve(silentFile);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read audio file"));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert AudioBuffer to WAV blob
   */
  private static audioBufferToWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, bufferLength - 8, true);
    this.writeString(view, 8, "WAVE");

    // fmt chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true); // audio format
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    const channelData = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    let index = 0;
    while (index < buffer.length) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][index]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(
          offset + index * blockAlign + channel * bytesPerSample,
          intSample,
          true,
        );
      }
      index++;
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  private static writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Check if a file has audio
  static async hasAudio(file: File): Promise<boolean> {
    if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      return true; // Always show mute option for videos/audio
    }
    return false; // Images don't have audio
  }

  /**
   * Resize/compress large images before upload for faster send time.
   */
  static async optimizeImageForUpload(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) return file;

    const SIZE_THRESHOLD = 1.2 * 1024 * 1024; // 1.2MB
    if (file.size <= SIZE_THRESHOLD) return file;

    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);

      const maxSide = 1920;
      const longestSide = Math.max(bitmap.width, bitmap.height);
      const ratio = longestSide > maxSide ? maxSide / longestSide : 1;

      const targetWidth = Math.max(1, Math.round(bitmap.width * ratio));
      const targetHeight = Math.max(1, Math.round(bitmap.height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

      const targetType = file.type === "image/png" ? "image/webp" : "image/jpeg";
      const quality = 0.82;

      const optimizedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, targetType, quality);
      });

      if (!optimizedBlob) return file;
      if (optimizedBlob.size >= file.size * 0.95) return file;

      const extension = targetType === "image/webp" ? "webp" : "jpg";
      const optimizedName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

      return new File([optimizedBlob], optimizedName, {
        type: targetType,
      });
    } catch {
      return file;
    } finally {
      bitmap?.close?.();
    }
  }
}
