import { Elysia } from "elysia";
import { PaymentModel } from "@snipmatic/utils/types";

import { withAuth } from "../../config/auth.plugin";
import { PaymentService } from "./service";

export const payment = new Elysia({ prefix: "/payment" })
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
  .post("/stripe/webhook", async ({ request }) => {
    const signature = request.headers.get("stripe-signature");
    const rawBody = await request.text();

    return PaymentService.webhook(rawBody, signature);
  });
