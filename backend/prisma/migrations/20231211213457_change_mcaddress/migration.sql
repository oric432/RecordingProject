-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recording" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "MCAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordingLength" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL
);
INSERT INTO "new_Recording" ("MCAddress", "date", "filePath", "id", "name", "recordingLength") SELECT "MCAddress", "date", "filePath", "id", "name", "recordingLength" FROM "Recording";
DROP TABLE "Recording";
ALTER TABLE "new_Recording" RENAME TO "Recording";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
