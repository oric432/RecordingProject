/*
  Warnings:

  - The primary key for the `RunningRecording` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RunningRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "MCAdress" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RunningRecording" ("MCAdress", "date", "id") SELECT "MCAdress", "date", "id" FROM "RunningRecording";
DROP TABLE "RunningRecording";
ALTER TABLE "new_RunningRecording" RENAME TO "RunningRecording";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
