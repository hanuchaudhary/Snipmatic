import type { ClipModel } from "@snipmatic/utils";
import { api } from "../axios";

export abstract class ClipApi {
  static async preview({ url }: ClipModel["previewBody"]) {
    const res = await api.post('/clip/preview', { url })
    return res.data as ClipModel["previewResponse"]
  }
}