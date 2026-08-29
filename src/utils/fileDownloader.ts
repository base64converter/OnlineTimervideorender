/**
 * Resilient cross-browser file downloader utility.
 * Handles sandboxed iframe restrictions, mobile browsers,
 * File System Access API, Object URLs, and Base64 Data URL fallbacks.
 */

export interface DownloadFileOptions {
  blob?: Blob;
  blobUrl?: string;
  fileName: string;
  mimeType?: string;
}

export async function downloadFile({
  blob,
  blobUrl,
  fileName,
  mimeType = 'video/mp4',
}: DownloadFileOptions): Promise<{ success: boolean; method: string; error?: string }> {
  // If we only have a blobUrl, attempt to fetch the blob
  let finalBlob = blob;
  if (!finalBlob && blobUrl) {
    try {
      const response = await fetch(blobUrl);
      finalBlob = await response.blob();
    } catch {
      // In some sandboxes fetch(blobUrl) might fail, fallback to using url directly
    }
  }

  // 1. Try modern File System Access API (showSaveFilePicker)
  // This opens native OS file-save dialog and writes directly, bypassing sandbox anchor limitations.
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window && finalBlob) {
    try {
      const extension = fileName.split('.').pop() || 'mp4';
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Video File',
            accept: {
              [finalBlob.type || mimeType]: [`.${extension}`],
            },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(finalBlob);
      await writableStream.close();
      return { success: true, method: 'filesystem-api' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled save dialog
        return { success: false, method: 'filesystem-api', error: 'User cancelled save.' };
      }
      console.debug('showSaveFilePicker failed or not permitted, trying anchor trigger:', err);
    }
  }

  // 2. Standard anchor tag download using Object URL
  let tempUrl = blobUrl;
  let shouldRevoke = false;

  if (!tempUrl && finalBlob) {
    tempUrl = URL.createObjectURL(finalBlob);
    shouldRevoke = true;
  }

  if (tempUrl) {
    try {
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = tempUrl;
      anchor.download = fileName;
      anchor.setAttribute('download', fileName);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';

      document.body.appendChild(anchor);
      anchor.click();

      setTimeout(() => {
        try {
          document.body.removeChild(anchor);
          if (shouldRevoke && tempUrl) {
            URL.revokeObjectURL(tempUrl);
          }
        } catch {}
      }, 2000);

      return { success: true, method: 'anchor-object-url' };
    } catch (anchorErr) {
      console.warn('Anchor download failed, falling back to data URL:', anchorErr);
    }
  }

  // 3. Fallback: Base64 Data URL (useful in strict iframe sandboxes)
  if (finalBlob) {
    try {
      const base64DataUrl = await blobToDataUrl(finalBlob);
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = base64DataUrl;
      anchor.download = fileName;
      anchor.setAttribute('download', fileName);
      document.body.appendChild(anchor);
      anchor.click();

      setTimeout(() => {
        try {
          document.body.removeChild(anchor);
        } catch {}
      }, 2000);

      return { success: true, method: 'data-url' };
    } catch (dataErr: any) {
      console.error('Data URL fallback failed:', dataErr);
    }
  }

  // 4. Last resort: open in new tab
  if (tempUrl) {
    try {
      const newWin = window.open(tempUrl, '_blank');
      if (newWin) {
        return { success: true, method: 'open-tab' };
      }
    } catch {}
  }

  return {
    success: false,
    method: 'none',
    error: 'Could not trigger automatic download due to browser restrictions.',
  };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert Blob to base64 Data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
