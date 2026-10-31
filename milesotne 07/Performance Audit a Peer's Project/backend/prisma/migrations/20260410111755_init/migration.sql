-- CreateTable
CREATE TABLE "Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game" TEXT NOT NULL,
    "player" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "strategyNote" TEXT NOT NULL
);
