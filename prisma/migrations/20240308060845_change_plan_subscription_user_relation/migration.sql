-- AlterTable
ALTER TABLE "BasicPlanSubscriptions" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userPlanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PagarmePlanSubscription" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userPlanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "statusRequest" BOOLEAN;
