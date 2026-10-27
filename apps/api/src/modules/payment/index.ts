import { PaymentModel } from "@snipmatic/utils/types";
import { Elysia } from "elysia";

import { withAuth } from "../../config/auth.plugin";
import { PaymentService } from "./service";

export const payment = new Elysia({ prefix: "/payment", tags: ["Payment"] })
  .use(withAuth)
  .post(
    "/checkout",
    async ({ body, user }) => {
      return PaymentService.createCheckoutSession(user.id, body.planTier);
    },
    {
      auth: true,
      body: PaymentModel.checkoutBody,
      response: {
        200: PaymentModel.checkoutResponse,
      },
    }
  )
  .get(
    "/credits",
    async ({ user }) => {
      return PaymentService.getCredits(user.id);
    },
    {
      auth: true,
      response: {
        200: PaymentModel.creditsResponse,
      },
    }
  )
  .get("/account", async ({ user }) => PaymentService.getAccount(user.id), {
    auth: true,
    response: { 200: PaymentModel.accountResponse },
  })
  .post(
    "/portal",
    async ({ user }) => {
      return PaymentService.createPortalSession(user.id);
    },
    {
      auth: true,
      response: {
        200: PaymentModel.portalResponse,
      },
    }
  )
  .post("/dodo/webhook", async ({ request }) => {
    const rawBody = await request.text();

    return PaymentService.webhook(rawBody, request.headers);
  });
