import type {
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
  ProjectModel,
} from "@snipmatic/utils";

import { api } from "../axios";

export abstract class ClipApi {
  static async preview({ url }: PreviewModel["body"]) {
    const res = await api.post("/clip/preview", { url });
    return res.data as PreviewModel["response"];
  }

  static async presignedUrl(body: PresignedUrlModel["body"]) {
    const res = await api.post("/clip/presigned-url", body);
    return res.data as PresignedUrlModel["response"];
  }

  static async process(body: ProcessModel["body"]) {
    const res = await api.post("/clip/process", body);
    return res.data as ProcessModel["response"];
  }

  static async get(id: string) {
    const res = await api.get(`/clip/${id}`);
    return res.data as ProjectModel["response"];
  }

  static async list(status: ProjectModel["listQuery"]["status"]) {
    const res = await api.get("/clip", { params: { status } });
    return res.data as ProjectModel["listResponse"];
  }
}
