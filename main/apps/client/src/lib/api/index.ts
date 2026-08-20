import type { ClipModel } from "@snipmatic/utils";
import { api } from "../axios";

export abstract class ClipApi {
  static async preview({ url }: ClipModel["previewBody"]) {
    const res = await api.post('/clip/preview', { url })
    return res.data as ClipModel["previewResponse"]
  }

  static async presignedUrl({ filename }: ClipModel["presignedUrlBody"]) {
    const res = await api.post('/clip/presigned-url', { filename })
    return res.data as ClipModel["presignedUrlResponse"]
  }

  static async process(body: ClipModel["processClipBody"]) {
    const res = await api.post('/clip/process', body)
    return res.data as ClipModel["processClipResponse"]
  }
}