-- CreateTable
CREATE TABLE "CVSample" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CVSample_slug_key" ON "CVSample"("slug");

-- CreateIndex
CREATE INDEX "CVSample_industry_idx" ON "CVSample"("industry");

-- CreateIndex
CREATE INDEX "CVSample_seniority_idx" ON "CVSample"("seniority");

-- CreateIndex
CREATE INDEX "CVSample_language_idx" ON "CVSample"("language");

-- CreateIndex
CREATE INDEX "CVSample_industry_seniority_language_idx" ON "CVSample"("industry", "seniority", "language");
