-- CreateEnum
CREATE TYPE "Owner" AS ENUM ('PERSONAL', 'STUDIO');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('WEB_APP', 'WEBSITE', 'GAME', 'TOOL', 'LIBRARY', 'BOT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('LIVE', 'BETA', 'IN_DEV', 'PROTOTYPE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" "Owner" NOT NULL DEFAULT 'PERSONAL',
    "kind" "ProjectKind" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IN_DEV',
    "subdomain" TEXT,
    "externalUrl" TEXT,
    "repoUrl" TEXT,
    "coverUrl" TEXT,
    "accent" TEXT NOT NULL DEFAULT '#00f0ff',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "genre" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "players" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'nbng',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_owner_published_idx" ON "Project"("owner", "published");

-- CreateIndex
CREATE UNIQUE INDEX "Project_owner_subdomain_key" ON "Project"("owner", "subdomain");

-- CreateIndex
CREATE INDEX "ContactMessage_handled_createdAt_idx" ON "ContactMessage"("handled", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
