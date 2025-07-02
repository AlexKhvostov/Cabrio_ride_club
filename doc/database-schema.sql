-- ================================================
-- CabrioRide Dashboard - Database Schema
-- ================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. Таблица участников клуба
-- ================================================
CREATE TABLE `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_id` bigint(20) DEFAULT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `join_date` date NOT NULL,
  `status` enum('активный','участник','новый','неактивный') NOT NULL DEFAULT 'новый',
  `isAdmin` BOOLEAN NOT NULL DEFAULT FALSE,
  `message_count` int(11) NOT NULL DEFAULT 0,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telegram_id` (`telegram_id`),
  KEY `status` (`status`),
  KEY `city` (`city`),
  KEY `isAdmin` (`isAdmin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 2. Таблица автомобилей
-- ================================================
CREATE TABLE `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(11) NOT NULL,
  `reg_number` varchar(20) NOT NULL UNIQUE,
  `color` varchar(50) NOT NULL,
  `engine_volume` varchar(10) DEFAULT NULL,
  `photos` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reg_number` (`reg_number`),
  KEY `member_id` (`member_id`),
  KEY `brand` (`brand`),
  KEY `year` (`year`),
  CONSTRAINT `cars_member_id` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 3. Таблица приглашений
-- ================================================
CREATE TABLE `invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `car_id` int(11) DEFAULT NULL,
  `inviter_member_id` int(11) DEFAULT NULL,
  `invitation_date` date NOT NULL,
  `location` varchar(200) NOT NULL,
  `status` enum('приглашение','вступил в клуб','отклонено') NOT NULL DEFAULT 'приглашение',
  `photos` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `car_id` (`car_id`),
  KEY `inviter_member_id` (`inviter_member_id`),
  KEY `status` (`status`),
  KEY `invitation_date` (`invitation_date`),
  CONSTRAINT `invitations_car_id` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invitations_inviter_member_id` FOREIGN KEY (`inviter_member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 4. Таблица событий клуба
-- ================================================
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(300) NOT NULL,
  `city` varchar(100) NOT NULL,
  `type` enum('заезд','встреча','фотосессия','техническая встреча') NOT NULL,
  `status` enum('запланировано','проводится','завершено','отменено') NOT NULL DEFAULT 'запланировано',
  `organizer_id` int(11) NOT NULL,
  `participants_count` int(11) NOT NULL DEFAULT 0,
  `max_participants` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `photos` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `organizer_id` (`organizer_id`),
  KEY `event_date` (`event_date`),
  KEY `city` (`city`),
  KEY `type` (`type`),
  KEY `status` (`status`),
  CONSTRAINT `events_organizer_id` FOREIGN KEY (`organizer_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 5. Таблица сервисов
-- ================================================
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `address` varchar(300) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `type` enum('автосервис','детейлинг','шиномонтаж','тюнинг','страхование') NOT NULL,
  `recommendation` enum('рекомендуется','не рекомендуется','нейтрально') NOT NULL DEFAULT 'нейтрально',
  `rating` decimal(2,1) DEFAULT NULL,
  `price_range` enum('низкий','средний','высокий') DEFAULT NULL,
  `working_hours` varchar(100) DEFAULT NULL,
  `photos` text DEFAULT NULL,
  `added_by_member_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `city` (`city`),
  KEY `type` (`type`),
  KEY `recommendation` (`recommendation`),
  KEY `rating` (`rating`),
  KEY `added_by_member_id` (`added_by_member_id`),
  CONSTRAINT `services_added_by_member_id` FOREIGN KEY (`added_by_member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 6. Создание индексов для оптимизации
-- ================================================

-- Составные индексы для частых запросов
CREATE INDEX `idx_members_status_city` ON `members` (`status`, `city`);
CREATE INDEX `idx_cars_brand_model` ON `cars` (`brand`, `model`);
CREATE INDEX `idx_events_date_status` ON `events` (`event_date`, `status`);
CREATE INDEX `idx_services_city_type` ON `services` (`city`, `type`);

-- ================================================
-- 7. Настройка кодировки и коллации
-- ================================================
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- Готово! База данных создана и готова к использованию
-- ================================================ 