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

  static async get(id: string) {
    const res = await api.get(`/clip/${id}`)
    return res.data as ClipModel["clipResponse"]
  }

  static async list(status: ClipModel["listQuery"]["status"]) {
    const res = await api.get('/clip', { params: { status } })
    return res.data as ClipModel["listResponse"]
  }
}