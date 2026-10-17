ALTER TABLE "UserBilling" DROP COLUMN "stripeCustomerId";
ALTER TABLE "UserBilling" DROP COLUMN "stripeSubscriptionId";
ALTER TABLE "UserBilling" ADD COLUMN "dodoCustomerId" TEXT;
ALTER TABLE "UserBilling" ADD COLUMN "dodoSubscriptionId" TEXT;
CREATE UNIQUE INDEX "UserBilling_dodoCustomerId_key" ON "UserBilling"("dodoCustomerId");
CREATE UNIQUE INDEX "UserBilling_dodoSubscriptionId_key" ON "UserBilling"("dodoSubscriptionId");

ALTER TABLE "CreditTransaction" RENAME COLUMN "stripeInvoiceId" TO "billingEventId";
ALTER INDEX "CreditTransaction_stripeInvoiceId_key" RENAME TO "CreditTransaction_billingEventId_key";
