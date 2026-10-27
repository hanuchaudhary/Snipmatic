import React from "react";
import { Check, Upload as UploadIcon } from "lucide-react";
import { motion, useAnimationControls } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"];

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const extensionFor = (filename: string) => {
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return extension.startsWith(".") ? extension : "";
};

function FilePage({ file }: { file: File }) {
  const extension = extensionFor(file.name).slice(1, 5).toUpperCase() || "VIDEO";

  return (
    <svg className="upl-page" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        className="upl-page-line"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path className="upl-page-line" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="31" height="16" x="0" y="18" rx="8" fill="currentColor" />
      <text x="15.5" y="29.1" textAnchor="middle" fontSize="8" className="upl-page-ext">
        {extension}
      </text>
    </svg>
  );
}

function RollingProgress({ value }: { value: number }) {
  const label = String(Math.round(value));

  return (
    <span className="upl-roll" aria-label={`${label}%`}>
      {label.split("").map((digit, index) => (
        <span key={`${label.length}-${index}`} className="upl-roll-col">
          <span className="upl-roll-strip" style={{ transform: `translateY(${-Number(digit)}em)` }}>
            {"0123456789".split("").map((number) => (
              <span key={number}>{number}</span>
            ))}
          </span>
        </span>
      ))}
      %
    </span>
  );
}

interface UploadVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (file: File) => Promise<boolean>;
  isUploading: boolean;
  progress: number;
  onCancel: () => void;
}

export function UploadVideoDialog({
  open,
  onOpenChange,
  onFileSelect,
  isUploading,
  progress,
  onCancel,
}: UploadVideoDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);
  const refusalTimer = React.useRef<number | null>(null);
  const [over, setOver] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const shake = useAnimationControls();

  React.useEffect(
    () => () => {
      if (refusalTimer.current) window.clearTimeout(refusalTimer.current);
    },
    []
  );

  React.useEffect(() => {
    if (!open) {
      dragDepth.current = 0;
      setOver(false);
      setFile(null);
      setRefusal(null);
    }
  }, [open]);

  const refuse = (message: string) => {
    setRefusal(message);
    void shake.start({ x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.42 } });
    if (refusalTimer.current) window.clearTimeout(refusalTimer.current);
    refusalTimer.current = window.setTimeout(() => setRefusal(null), 2200);
  };

  const acceptFile = async (nextFile?: File) => {
    if (!nextFile || isUploading) return;

    const extension = extensionFor(nextFile.name);
    if (!nextFile.type.startsWith("video/") && !ALLOWED_EXTENSIONS.includes(extension)) {
      refuse("Choose a video file");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      refuse("Video must be 4 GB or smaller");
      return;
    }

    setRefusal(null);
    setFile(nextFile);
    const uploaded = await onFileSelect(nextFile);
    if (!uploaded) setFile(null);
  };

  const pickFile = () => {
    if (!isUploading) inputRef.current?.click();
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen && isUploading) onCancel();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="upl-dialog gap-0 p-5 sm:max-w-lg">
        <DialogHeader className="gap-1 px-[.15rem] pb-4 pr-10">
          <DialogTitle>Upload a video</DialogTitle>
          <DialogDescription>Drop a recording here and we’ll prepare it for clipping.</DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mkv,.avi,.m4v"
          className="sr-only"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.target.value = "";
            void acceptFile(selected);
          }}
        />

        <motion.div animate={shake} className="upl-zone-wrap">
          <div
            className="upl-zone"
            data-over={over || undefined}
            data-refuse={refusal ? true : undefined}
            data-busy={isUploading || undefined}
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-disabled={isUploading}
            onClick={pickFile}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                pickFile();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              if (isUploading) return;
              dragDepth.current += 1;
              setOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isUploading) event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepth.current = Math.max(0, dragDepth.current - 1);
              if (dragDepth.current === 0) setOver(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              dragDepth.current = 0;
              setOver(false);
              void acceptFile(event.dataTransfer.files?.[0]);
            }}
          >
            {!file ? (
              <>
                <span className="upl-icon"><UploadIcon size={19} strokeWidth={2} /></span>
                <span className="upl-say">
                  <b>{refusal ?? (over ? "Drop to upload" : "Drag a video here")}</b>
                  <span>or click to browse · up to 4 GB</span>
                </span>
              </>
            ) : (
              <span className="upl-now">
                <FilePage file={file} />
                <span className="upl-text">
                  <span className="upl-name">{file.name}</span>
                  <span className="upl-meta">
                    {formatBytes(file.size)} · {progress >= 100 ? "Uploaded" : <RollingProgress value={progress} />}
                  </span>
                  <span className="upl-track">
                    <span className="upl-bar" style={{ transform: `scaleX(${progress / 100})` }} />
                  </span>
                </span>
                <span className="upl-end">
                  {progress >= 100 && <span className="upl-tick"><Check size={14} strokeWidth={2} /></span>}
                </span>
              </span>
            )}
          </div>
        </motion.div>

        <div className="upl-dialog-foot">
          <span>MP4, MOV, WebM, MKV, AVI or M4V</span>
          {isUploading && (
            <button
              type="button"
              className="upl-cancel"
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
                setFile(null);
              }}
            >
              Cancel upload
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
