-- CreateTable
CREATE TABLE "PopupStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "popupId" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "closes" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'bg',
    "source" TEXT,
    "popupId" INTEGER,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PopupStat_popupId_day_key" ON "PopupStat"("popupId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
