import { ClipModel } from "@snipmatic/utils/types";
import { Elysia } from "elysia";

import { withAuth } from "../../config/auth.plugin";
import { ClipService } from "./service";

export const clip = new Elysia({ prefix: "/clip", tags: ["Clip"] })
  .use(withAuth)
  .post(
    "/preview",
    async ({ body }) => {
      const response = await ClipService.preview(body);
      return response;
    },
    {
      body: ClipModel.previewBody,
      response: {
        200: ClipModel.previewResponse,
        400: ClipModel.invalidUrl,
      },
    }
  )
  .post(
    "/presigned-url",
    async ({ body, user }) => {
      const response = await ClipService.presignedUrl({
        ...body,
        userId: user.id,
      });
      return response;
    },
    {
      auth: true,
      body: ClipModel.presignedUrlBody,
      response: {
        200: ClipModel.presignedUrlResponse,
        400: ClipModel.invalidFilename,
      },
    }
  )
  .post(
    "/process",
    async ({ body, user }) => {
      const response = await ClipService.process({
        ...body,
        userId: user.id,
      });
      return response;
    },
    {
      auth: true,
      body: ClipModel.processClipBody,
      response: {
        200: ClipModel.processClipResponse,
        400: ClipModel.invalidUrl,
      },
    }
  )
  .get(
    "/",
    async ({ user, query }) => {
      const response = await ClipService.list(user.id, query.status);
      return response;
    },
    {
      auth: true,
      query: ClipModel.listQuery,
      response: {
        200: ClipModel.listResponse,
      },
    }
  )
  .get(
    "/:id",
    async ({ params, user }) => {
      const response = await ClipService.get(params.id, user.id);
      return response;
    },
    {
      auth: true,
      params: ClipModel.clipIdParams,
      response: {
        200: ClipModel.clipResponse,
        404: ClipModel.clipNotFound,
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const response = await ClipService.update(params.id, body);
      return response;
    },
    {
      params: ClipModel.clipIdParams,
      body: ClipModel.updateBody,
      response: {
        200: ClipModel.clipResponse,
        404: ClipModel.clipNotFound,
      },
    }
  );
