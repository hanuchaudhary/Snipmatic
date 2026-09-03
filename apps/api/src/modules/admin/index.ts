import { AdminModel } from "@snipmatic/utils/types";
import { Elysia } from "elysia";

import { withAdmin } from "../../config/auth.plugin";
import { AdminService } from "./service";

export const admin = new Elysia({ prefix: "/admin", tags: ["Admin"] })
  .use(withAdmin)
  .get(
    "/overview",
    async () => {
      return AdminService.overview();
    },
    {
      admin: true,
      response: {
        200: AdminModel.overviewResponse,
      },
    }
  )
  .get(
    "/users",
    async ({ query }) => {
      return AdminService.users(query);
    },
    {
      admin: true,
      query: AdminModel.usersQuery,
      response: {
        200: AdminModel.usersResponse,
      },
    }
  )
  .get(
    "/jobs",
    async ({ query }) => {
      return AdminService.jobs(query);
    },
    {
      admin: true,
      query: AdminModel.jobsQuery,
      response: {
        200: AdminModel.jobsResponse,
      },
    }
  );
