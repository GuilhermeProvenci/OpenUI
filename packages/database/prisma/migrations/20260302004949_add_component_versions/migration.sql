-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "currentVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ComponentVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "componentId" TEXT NOT NULL,
    "codeJsx" TEXT,
    "codeHtml" TEXT,
    "codeCss" TEXT,
    "codeJs" TEXT,
    "changeNote" TEXT,
    "suggestionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComponentVersion_suggestionId_key" ON "ComponentVersion"("suggestionId");

-- CreateIndex
CREATE INDEX "ComponentVersion_componentId_idx" ON "ComponentVersion"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentVersion_componentId_version_key" ON "ComponentVersion"("componentId", "version");

-- AddForeignKey
ALTER TABLE "ComponentVersion" ADD CONSTRAINT "ComponentVersion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentVersion" ADD CONSTRAINT "ComponentVersion_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
