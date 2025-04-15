-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `hallAddress` VARCHAR(191) NULL,
    `trainingTimes` VARCHAR(191) NULL,
    `teamLeaderId` INTEGER NULL,

    UNIQUE INDEX `Team_name_key`(`name`),
    UNIQUE INDEX `Team_teamLeaderId_key`(`teamLeaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false,
    `theme` VARCHAR(191) NOT NULL DEFAULT 'system',
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `passwordSetupToken` VARCHAR(191) NULL,
    `passwordSetupExpires` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_passwordResetToken_key`(`passwordResetToken`),
    UNIQUE INDEX `User_passwordSetupToken_key`(`passwordSetupToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTeam` (
    `userId` INTEGER NOT NULL,
    `teamId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `League` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `numberOfTeams` INTEGER NOT NULL,
    `hasReturnMatches` BOOLEAN NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `scoreEntryType` ENUM('MATCH_SCORE', 'SET_SCORES') NOT NULL DEFAULT 'MATCH_SCORE',
    `setsToWin` INTEGER NOT NULL DEFAULT 3,
    `pointsWin30` INTEGER NOT NULL DEFAULT 3,
    `pointsWin31` INTEGER NOT NULL DEFAULT 3,
    `pointsWin32` INTEGER NOT NULL DEFAULT 2,
    `pointsLoss32` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `League_name_key`(`name`),
    UNIQUE INDEX `League_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fixture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leagueId` INTEGER NOT NULL,
    `round` INTEGER NULL,
    `matchday` INTEGER NULL,
    `homeTeamId` INTEGER NOT NULL,
    `awayTeamId` INTEGER NOT NULL,
    `fixtureDate` DATETIME(3) NULL,
    `fixtureTime` VARCHAR(191) NULL,
    `homeScore` INTEGER NULL,
    `awayScore` INTEGER NULL,
    `homeSet1` INTEGER NULL,
    `awaySet1` INTEGER NULL,
    `homeSet2` INTEGER NULL,
    `awaySet2` INTEGER NULL,
    `homeSet3` INTEGER NULL,
    `awaySet3` INTEGER NULL,
    `homeSet4` INTEGER NULL,
    `awaySet4` INTEGER NULL,
    `homeSet5` INTEGER NULL,
    `awaySet5` INTEGER NULL,
    `homePoints` INTEGER NULL,
    `awayPoints` INTEGER NULL,
    `homeMatchPoints` INTEGER NULL,
    `awayMatchPoints` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,

    INDEX `Fixture_leagueId_idx`(`leagueId`),
    INDEX `Fixture_homeTeamId_idx`(`homeTeamId`),
    INDEX `Fixture_awayTeamId_idx`(`awayTeamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_LeagueToTeam` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_LeagueToTeam_AB_unique`(`A`, `B`),
    INDEX `_LeagueToTeam_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_teamLeaderId_fkey` FOREIGN KEY (`teamLeaderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeam` ADD CONSTRAINT `UserTeam_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeam` ADD CONSTRAINT `UserTeam_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fixture` ADD CONSTRAINT `Fixture_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fixture` ADD CONSTRAINT `Fixture_homeTeamId_fkey` FOREIGN KEY (`homeTeamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fixture` ADD CONSTRAINT `Fixture_awayTeamId_fkey` FOREIGN KEY (`awayTeamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LeagueToTeam` ADD CONSTRAINT `_LeagueToTeam_A_fkey` FOREIGN KEY (`A`) REFERENCES `League`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LeagueToTeam` ADD CONSTRAINT `_LeagueToTeam_B_fkey` FOREIGN KEY (`B`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
