-- Enrich the CV model: rename/replace `content` with structured columns
-- (templateId, status, data, atsScore) and add cascade delete + indexes.
-- Also enforce uniqueness on Stripe identifiers on User.

-- RedefineTables (SQLite-style table rebuild because we change column shape)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CV" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled CV',
    "templateId" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "data" TEXT NOT NULL DEFAULT '{}',
    "atsScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_CV" ("createdAt", "id", "title", "updatedAt", "userId")
SELECT "createdAt", "id", "title", "updatedAt", "userId" FROM "CV";

DROP TABLE "CV";
ALTER TABLE "new_CV" RENAME TO "CV";

CREATE INDEX "CV_userId_idx" ON "CV"("userId");
CREATE INDEX "CV_userId_status_idx" ON "CV"("userId", "status");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
