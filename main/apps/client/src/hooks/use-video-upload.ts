import React from "react";

import { ClipApi } from "@/lib/api";

const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"];

export type VideoUploadResult = {
  key: string;
  filename: string;
  duration: number;
  previewUrl: string;
};

const getFileExtension = (filename: string) => {
  const index = filename.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filename.slice(index).toLowerCase();
};

const validateVideoFile = (file: File) => {
  const extension = getFileExtension(file.name);
  const isVideoMime = file.type.startsWith("video/");
  const isAllowedExtension = ALLOWED_EXTENSIONS.includes(extension);

  if (!isVideoMime && !isAllowedExtension) {
    throw new Error("Please upload a valid video file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Video file must be 4GB or smaller.");
  }
};

const extractVideoDuration = (previewUrl: string) => {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration)
        ? Math.floor(video.duration)
        : 0;
      resolve(Math.max(1, duration));
    };

    video.onerror = () => {
      reject(new Error("Unable to read video metadata."));
    };

    video.src = previewUrl;
  });
};

const uploadToPresignedUrl = ({
  file,
  url,
  onProgress,
  signal,
}: {
  file: File;
  url: string;
  onProgress: (value: number) => void;
  signal: AbortSignal;
}) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    const handleAbort = () => {
      xhr.abort();
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    if (signal.aborted) {
      handleAbort();
      return;
    }

    signal.addEventListener("abort", handleAbort);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      signal.removeEventListener("abort", handleAbort);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error("Upload failed. Please try again."));
    };

    xhr.onerror = () => {
      signal.removeEventListener("abort", handleAbort);
      reject(new Error("Upload failed. Please check your connection."));
    };

    xhr.onabort = () => {
      signal.removeEventListener("abort", handleAbort);
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    xhr.send(file);
  });
};

export const useVideoUpload = () => {
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!isUploading) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUploading]);

  const abort = React.useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsUploading(false);
    setProgress(0);
  }, []);

  const reset = React.useCallback(() => {
    abort();
    setError(null);
  }, [abort]);

  const upload = React.useCallback(async (file: File) => {
    validateVideoFile(file);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const previewUrl = URL.createObjectURL(file);

    try {
      const duration = await extractVideoDuration(previewUrl);

      if (controller.signal.aborted) {
        throw new DOMException("Upload aborted", "AbortError");
      }

      const { url, key, publicUrl } = await ClipApi.presignedUrl({
        filename: file.name,
      });

      if (controller.signal.aborted) {
        throw new DOMException("Upload aborted", "AbortError");
      }

      await uploadToPresignedUrl({
        file,
        url,
        onProgress: setProgress,
        signal: controller.signal,
      });

      return {
        key,
        filename: file.name,
        duration,
        previewUrl: publicUrl,
      } satisfies VideoUploadResult;
    } catch (uploadError) {
      URL.revokeObjectURL(previewUrl);

      if (
        uploadError instanceof DOMException &&
        uploadError.name === "AbortError"
      ) {
        throw uploadError;
      }

      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload video.";

      setError(message);
      throw uploadError;
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, []);

  return {
    upload,
    progress,
    isUploading,
    error,
    abort,
    reset,
  };
};
