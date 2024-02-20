-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RunningRecording" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "MCAdress" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RunningRecording" ("MCAdress", "id") SELECT "MCAdress", "id" FROM "RunningRecording";
DROP TABLE "RunningRecording";
ALTER TABLE "new_RunningRecording" RENAME TO "RunningRecording";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
