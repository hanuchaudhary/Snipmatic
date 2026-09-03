import type { PaymentModel } from "@snipmatic/utils";
import { api } from "../axios";

export abstract class PaymentApi {
  static async checkout({ planTier }: PaymentModel["checkoutBody"]) {
    const res = await api.post("/payment/checkout", { planTier });
    return res.data as PaymentModel["checkoutResponse"];
  }

  static async getCredits() {
    const res = await api.get("/payment/credits");
    return res.data as PaymentModel["creditsResponse"];
  }

  static async createPortal() {
    const res = await api.post("/payment/portal");
    return res.data as PaymentModel["portalResponse"];
  }
}
