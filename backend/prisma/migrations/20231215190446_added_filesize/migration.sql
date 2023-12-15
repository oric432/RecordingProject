-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recording" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "MCAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordingLength" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL DEFAULT '10kb'
);
INSERT INTO "new_Recording" ("MCAddress", "date", "filePath", "id", "name", "recordingLength") SELECT "MCAddress", "date", "filePath", "id", "name", "recordingLength" FROM "Recording";
DROP TABLE "Recording";
ALTER TABLE "new_Recording" RENAME TO "Recording";
CREATE UNIQUE INDEX "Recording_filePath_key" ON "Recording"("filePath");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
