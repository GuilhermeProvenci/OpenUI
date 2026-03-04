-- CreateTable
CREATE TABLE "ComponentSave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComponentSave_userId_idx" ON "ComponentSave"("userId");

-- CreateIndex
CREATE INDEX "ComponentSave_componentId_idx" ON "ComponentSave"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentSave_userId_componentId_key" ON "ComponentSave"("userId", "componentId");

-- AddForeignKey
ALTER TABLE "ComponentSave" ADD CONSTRAINT "ComponentSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentSave" ADD CONSTRAINT "ComponentSave_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
