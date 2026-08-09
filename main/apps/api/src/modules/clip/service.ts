import { status } from 'elysia'

import type { ClipModel } from "@snipmatic/utils/types"
import { getVideoInfo } from '../../config/yt-dlp'

export abstract class ClipService {
  static async preview({ url }: ClipModel['previewBody']) {
    const video = await getVideoInfo(url);
    if (!video) {
      throw status(
        400,
        'Invalid url' satisfies ClipModel['invalidUrl']
      )
    }

    return video as ClipModel['previewResponse']
  }

}