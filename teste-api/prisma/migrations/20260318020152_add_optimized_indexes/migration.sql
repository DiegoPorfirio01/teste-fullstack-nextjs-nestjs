-- DropIndex
DROP INDEX "credit_purchases_user_id_idx";

-- DropIndex
DROP INDEX "transactions_receiver_id_idx";

-- DropIndex
DROP INDEX "transactions_sender_id_idx";

-- CreateIndex
CREATE INDEX "credit_purchases_user_id_created_at_idx" ON "credit_purchases"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_sender_id_created_at_idx" ON "transactions"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_receiver_id_created_at_idx" ON "transactions"("receiver_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_receiver_id_type_status_created_at_idx" ON "transactions"("receiver_id", "type", "status", "created_at");
