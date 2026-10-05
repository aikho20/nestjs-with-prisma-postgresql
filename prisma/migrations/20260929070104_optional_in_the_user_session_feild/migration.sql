-- AlterTable
ALTER TABLE "user_sessions" ALTER COLUMN "ip_address" DROP NOT NULL,
ALTER COLUMN "revoke_at" DROP NOT NULL;
