import {
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
  ProjectModel,
} from "@snipmatic/utils/types";
import { Elysia } from "elysia";

import { withAuth } from "../../config/auth.plugin";
import { requireProcessorAuth } from "../../config/processor-auth";
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
      query: ProjectModel.listQuery,
      response: {
        200: ProjectModel.listResponse,
      },
    }
  )
  .post(
    "/:id/complete",
    async ({ params, body, request }) => {
      requireProcessorAuth(request.headers);
      return ClipService.completeProject(params.id, body);
    },
    {
      params: ProjectModel.params,
      body: ProjectModel.completeBody,
      response: { 200: ProjectModel.completeResponse },
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
      params: ProjectModel.params,
      response: {
        200: ProjectModel.response,
        404: ProjectModel.notFound,
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, request }) => {
      requireProcessorAuth(request.headers);
      const response = await ClipService.updateProject(params.id, body);
      return response;
    },
    {
      params: ProjectModel.params,
      body: ProjectModel.updateBody,
      response: {
        200: ProjectModel.response,
        404: ProjectModel.notFound,
      },
    }
  );
