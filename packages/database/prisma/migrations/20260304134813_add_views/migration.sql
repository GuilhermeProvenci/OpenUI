-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "uniqueViewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ComponentView" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "componentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComponentView_componentId_idx" ON "ComponentView"("componentId");

-- CreateIndex
CREATE INDEX "ComponentView_userId_componentId_idx" ON "ComponentView"("userId", "componentId");

-- CreateIndex
CREATE INDEX "Component_viewCount_idx" ON "Component"("viewCount");

-- CreateIndex
CREATE INDEX "Component_uniqueViewCount_idx" ON "Component"("uniqueViewCount");

-- AddForeignKey
ALTER TABLE "ComponentView" ADD CONSTRAINT "ComponentView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentView" ADD CONSTRAINT "ComponentView_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
