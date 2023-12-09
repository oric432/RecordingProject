-- CreateTable
CREATE TABLE "Recording" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "MCAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "recordingLength" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Recording_MCAddress_key" ON "Recording"("MCAddress");
