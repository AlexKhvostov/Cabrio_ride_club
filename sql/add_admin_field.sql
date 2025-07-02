-- ================================================
-- Добавление поля isAdmin в таблицу members
-- ================================================

-- Добавляем поле isAdmin в таблицу members
ALTER TABLE `members` 
ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT FALSE 
AFTER `status`;

-- Добавляем индекс для оптимизации запросов по админам
CREATE INDEX `idx_members_isAdmin` ON `members` (`isAdmin`);

-- Пример: назначить первого пользователя админом (замените на нужный telegram_id)
-- UPDATE `members` SET `isAdmin` = TRUE WHERE `telegram_id` = 123456789;

-- ================================================
-- Готово! Поле isAdmin добавлено
-- ================================================ 