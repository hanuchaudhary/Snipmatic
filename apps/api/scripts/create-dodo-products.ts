import { PLANS } from "@snipmatic/utils";

import { getDodoClient, paidPlanTiers } from "../src/config/dodo";

const dodo = getDodoClient();
const existingProducts = [];
for await (const product of dodo.products.list()) {
  existingProducts.push(product);
}

for (const tier of paidPlanTiers) {
  const plan = PLANS[tier];
  const existingId = process.env[`DODO_PRODUCT_${tier.toUpperCase()}`];
  if (existingId) {
    const existing = await dodo.products.retrieve(existingId);
    if (
      existing.price.type !== "recurring_price" ||
      existing.price.currency !== "USD" ||
      existing.price.price !== plan.price * 100
    ) {
      throw new Error(
        `Configured ${tier} product has a different price or billing type`
      );
    }
    console.log(`DODO_PRODUCT_${tier.toUpperCase()}=${existing.product_id}`);
    continue;
  }

  const matches = existingProducts.filter(
    (product) =>
      product.metadata.app === "snipmatic" && product.metadata.planTier === tier
  );
  if (matches.length > 1)
    throw new Error(
      `Multiple ${tier} products found; set DODO_PRODUCT_${tier.toUpperCase()} explicitly`
    );
  if (matches[0]) {
    const existing = await dodo.products.retrieve(matches[0].product_id);
    if (
      existing.price.type !== "recurring_price" ||
      existing.price.currency !== "USD" ||
      existing.price.price !== plan.price * 100
    ) {
      throw new Error(
        `Existing ${tier} product has a different price or billing type`
      );
    }
    console.log(`DODO_PRODUCT_${tier.toUpperCase()}=${existing.product_id}`);
    continue;
  }

  const product = await dodo.products.create({
    name: `${plan.name} monthly`,
    description: `${plan.monthlyCredits} Snipmatic credits each month`,
    tax_category: "saas",
    metadata: { app: "snipmatic", planTier: tier },
    price: {
      type: "recurring_price",
      currency: "USD",
      price: plan.price * 100,
      discount: 0,
      payment_frequency_count: 1,
      payment_frequency_interval: "Month",
      subscription_period_count: 120,
      subscription_period_interval: "Month",
      purchasing_power_parity: false,
    },
  });

  console.log(`DODO_PRODUCT_${tier.toUpperCase()}=${product.product_id}`);
}
