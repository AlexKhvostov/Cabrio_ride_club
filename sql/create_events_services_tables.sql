-- ================================================
-- SQL скрипт создания таблиц Events и Services
-- для CabrioRide Dashboard
-- ================================================

-- Устанавливаем кодировку
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. Таблица событий клуба (events)
-- ================================================
CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT 'Название события',
  `description` text DEFAULT NULL COMMENT 'Описание события',
  `event_date` date NOT NULL COMMENT 'Дата события',
  `event_time` time DEFAULT NULL COMMENT 'Время события',
  `location` varchar(300) NOT NULL COMMENT 'Место проведения',
  `city` varchar(100) NOT NULL COMMENT 'Город',
  `type` enum('заезд','встреча','фотосессия','поездка','банкет','техническая встреча') NOT NULL COMMENT 'Тип события',
  `status` enum('запланировано','проводится','завершено','отменено') NOT NULL DEFAULT 'запланировано' COMMENT 'Статус события',
  `organizer_id` int(11) NOT NULL COMMENT 'ID организатора',
  `participants_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Количество участников',
  `max_participants` int(11) DEFAULT NULL COMMENT 'Максимум участников',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Стоимость участия',
  `photos` text DEFAULT NULL COMMENT 'Фотографии в JSON формате',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
  PRIMARY KEY (`id`),
  KEY `idx_organizer_id` (`organizer_id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_city` (`city`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_date_status` (`event_date`, `status`),
  CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='События клуба кабриолетов';

-- ================================================
-- 2. Таблица сервисов (services)
-- ================================================
CREATE TABLE IF NOT EXISTS `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT 'Название сервиса',
  `description` text DEFAULT NULL COMMENT 'Описание услуг',
  `city` varchar(100) NOT NULL COMMENT 'Город',
  `address` varchar(300) DEFAULT NULL COMMENT 'Адрес',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Телефон',
  `website` varchar(200) DEFAULT NULL COMMENT 'Веб-сайт',
  `type` enum('автосервис','детейлинг','шиномонтаж','электрик','автомойка','тюнинг','страхование') NOT NULL COMMENT 'Тип услуг',
  `recommendation` enum('рекомендуется','не рекомендуется','нейтрально') NOT NULL DEFAULT 'нейтрально' COMMENT 'Рекомендация клуба',
  `rating` decimal(2,1) DEFAULT NULL COMMENT 'Рейтинг от 1.0 до 5.0',
  `reviews_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Количество отзывов',
  `services_list` text DEFAULT NULL COMMENT 'Список услуг в JSON формате',
  `price_range` enum('низкий','средний','высокий') DEFAULT NULL COMMENT 'Ценовой диапазон',
  `working_hours` varchar(100) DEFAULT NULL COMMENT 'Часы работы',
  `photos` text DEFAULT NULL COMMENT 'Фотографии в JSON формате',
  `added_by_member_id` int(11) DEFAULT NULL COMMENT 'Кто добавил сервис',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата добавления',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
  PRIMARY KEY (`id`),
  KEY `idx_city` (`city`),
  KEY `idx_type` (`type`),
  KEY `idx_recommendation` (`recommendation`),
  KEY `idx_rating` (`rating`),
  KEY `idx_added_by_member_id` (`added_by_member_id`),
  KEY `idx_city_type` (`city`, `type`),
  CONSTRAINT `fk_services_added_by` FOREIGN KEY (`added_by_member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_rating_range` CHECK (`rating` IS NULL OR (`rating` >= 1.0 AND `rating` <= 5.0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Каталог сервисов для кабриолетов';

-- ================================================
-- 3. Добавление тестовых данных для событий
-- ================================================
INSERT INTO `events` (`title`, `description`, `event_date`, `event_time`, `location`, `city`, `type`, `status`, `organizer_id`, `participants_count`, `max_participants`, `price`, `photos`) VALUES
('Весенний заезд 2025', 'Традиционный весенний заезд участников клуба', '2025-04-15', '10:00:00', 'Минск-Арена', 'Минск', 'заезд', 'запланировано', 287536885, 25, 50, 0.00, '["event_1_1750625329369_1.jpg", "event_1_1750625329370_2.jpg"]'),

('Фотосессия в центре', 'Групповая фотосессия кабриолетов', '2025-05-20', '14:00:00', 'Площадь Независимости', 'Минск', 'фотосессия', 'запланировано', 5625181605, 15, 30, 0.00, '["event_2_1750625329371_1.jpg", "event_2_1750625329372_2.jpg", "event_2_1750625329373_3.jpg"]'),

('Техническая встреча', 'Обсуждение технических вопросов', '2025-03-10', '18:00:00', 'Автосервис Premium', 'Минск', 'техническая встреча', 'завершено', 287536885, 12, 20, 0.00, '["event_3_1750625329374_1.jpg"]'),

('Поездка в Мир', 'Выезд к замку в Мире', '2025-06-01', '09:00:00', 'Замок Мир', 'Мир', 'поездка', 'запланировано', 5625181605, 0, 25, 500.00, '["event_4_1750625329375_1.jpg", "event_4_1750625329376_2.jpg"]'),

('Банкет клуба', 'Годовой банкет участников', '2025-12-25', '19:00:00', 'Ресторан Европа', 'Минск', 'банкет', 'запланировано', 287536885, 0, 40, 2500.00, '[]'),

('Встреча новичков', 'Знакомство с новыми участниками', '2025-02-28', '16:00:00', 'Кафе Drive', 'Минск', 'встреча', 'завершено', 5625181605, 8, 15, 0.00, '["event_6_1750625329377_1.jpg", "event_6_1750625329378_2.jpg"]');

-- ================================================
-- 4. Добавление тестовых данных для сервисов
-- ================================================
INSERT INTO `services` (`name`, `description`, `city`, `address`, `phone`, `website`, `type`, `recommendation`, `rating`, `reviews_count`, `services_list`, `price_range`, `working_hours`, `photos`, `added_by_member_id`) VALUES
('Автосервис Premium', 'Специализированный сервис по обслуживанию кабриолетов. Ремонт крыш, диагностика, ТО.', 'Минск', 'ул. Автомобильная, 15', '+375 29 123-45-67', 'www.premium-auto.by', 'автосервис', 'рекомендуется', 4.8, 15, '["Ремонт крыш", "Диагностика", "ТО", "Кузовной ремонт"]', 'средний', 'Пн-Пт 9:00-18:00', '["service_1_1750625329380_1.jpg", "service_1_1750625329381_2.jpg"]', 287536885),

('Детейлинг "Блеск"', 'Профессиональная химчистка и детейлинг автомобилей. Специальные программы для кабриолетов.', 'Минск', 'ул. Чистая, 8', '+375 29 987-65-43', NULL, 'детейлинг', 'рекомендуется', 4.9, 12, '["Химчистка салона", "Полировка кузова", "Защитные покрытия", "Чистка крыши"]', 'высокий', 'Ежедневно 8:00-20:00', '["service_2_1750625329382_1.jpg"]', 5625181605),

('Шиномонтаж "Быстрые колеса"', 'Круглосуточный шиномонтаж с выездом. Хранение сезонных шин.', 'Минск', 'пр. Колесный, 22', '+375 29 555-12-34', NULL, 'шиномонтаж', 'рекомендуется', 4.3, 8, '["Шиномонтаж", "Балансировка", "Хранение шин", "Выездной сервис"]', 'низкий', 'Круглосуточно', '["service_3_1750625329383_1.jpg", "service_3_1750625329384_2.jpg"]', 5625181605),

('Автоэлектрик Иван', 'Частный мастер по автоэлектрике. Специализируется на электрических крышах кабриолетов.', 'Минск', NULL, '+375 29 123-45-67', NULL, 'электрик', 'рекомендуется', 4.7, 6, '["Ремонт электрики", "Диагностика", "Ремонт крыш", "Установка сигнализации"]', 'средний', 'По договоренности', '[]', 287536885),

('СТО "Гараж 77"', 'Сомнительный сервис с плохой репутацией. Были случаи некачественного ремонта.', 'Минск', 'ул. Темная, 13', '+375 29 000-00-00', NULL, 'автосервис', 'не рекомендуется', 2.1, 4, '["Ремонт двигателя", "Кузовной ремонт", "ТО"]', 'низкий', 'Пн-Сб 9:00-17:00', '[]', 287536885),

('Автомойка "Кристалл"', 'Качественная автомойка с бесконтактной мойкой и ручной сушкой.', 'Минск', 'ул. Чистая, 45', '+375 29 777-88-99', NULL, 'автомойка', 'рекомендуется', 4.5, 10, '["Бесконтактная мойка", "Ручная сушка", "Мойка двигателя", "Чернение шин"]', 'низкий', 'Ежедневно 7:00-22:00', '["service_6_1750625329385_1.jpg"]', 5625181605);

-- ================================================
-- 5. Обновление статистики в существующих данных
-- ================================================

-- Обновляем статистику upcoming_events и total_events
-- (если нужно будет обновить таблицу статистики)

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 6. Проверка созданных таблиц
-- ================================================
SELECT 'Таблица events создана' as status, COUNT(*) as records FROM events
UNION ALL
SELECT 'Таблица services создана' as status, COUNT(*) as records FROM services;

-- Показать структуру таблиц
SHOW CREATE TABLE events;
SHOW CREATE TABLE services; 