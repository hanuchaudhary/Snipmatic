import {
  ClipModel,
  JobModel,
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
} from "@snipmatic/utils/types";
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
      body: PreviewModel.body,
      response: {
        200: PreviewModel.response,
        400: PreviewModel.invalidUrl,
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
      body: PresignedUrlModel.body,
      response: {
        200: PresignedUrlModel.response,
        400: PresignedUrlModel.invalidFilename,
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
      body: ProcessModel.body,
      response: {
        200: ProcessModel.response,
        400: ProcessModel.insufficientCredits,
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
      query: JobModel.listQuery,
      response: {
        200: JobModel.listResponse,
      },
    }
  )
  .patch(
    "/output/:id",
    async ({ params, body }) => {
      const response = await ClipService.updateClip(params.id, body);
      return response;
    },
    {
      params: ClipModel.params,
      body: ClipModel.updateBody,
      response: {
        200: ClipModel.response,
        404: ClipModel.notFound,
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
      params: JobModel.params,
      response: {
        200: JobModel.response,
        404: JobModel.notFound,
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const response = await ClipService.updateJob(params.id, body);
      return response;
    },
    {
      params: JobModel.params,
      body: JobModel.updateBody,
      response: {
        200: JobModel.response,
        404: JobModel.notFound,
      },
    }
  );
