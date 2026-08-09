import { Elysia } from 'elysia'
import { ClipService } from './service'
import { ClipModel } from "@snipmatic/utils/types"

export const clip = new Elysia({ prefix: '/clip' })
  .post(
    '/preview',
    async ({ body }) => {
      const response = await ClipService.preview(body)
      return response
    }, {
    body: ClipModel.previewBody,
    response: {
      200: ClipModel.previewResponse,
      400: ClipModel.invalidUrl
    }
  }
  )