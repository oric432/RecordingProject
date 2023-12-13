/*
  Warnings:

  - A unique constraint covering the columns `[filePath]` on the table `Recording` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Recording_filePath_key" ON "Recording"("filePath");
