# 📊 Требования к базе данных CabrioRide Dashboard

## 🎯 Общая информация
Проект использует PHP API + JavaScript заглушки. Необходимо подготовить MySQL базу данных для полноценной работы.

## 📋 Список таблиц и структуры данных

### 1. 👥 Таблица `members` (Участники клуба)

**Обязательные поля:**
- `id` - уникальный идентификатор (PRIMARY KEY, AUTO_INCREMENT)
- `telegram_id` - ID пользователя в Telegram (BIGINT, UNIQUE)
- `first_name` - имя (VARCHAR(100))
- `last_name` - фамилия (VARCHAR(100), NULL)
- `nickname` - никнейм в Telegram (VARCHAR(100), NULL)
- `city` - город (VARCHAR(100), NULL)
- `join_date` - дата вступления (DATE)
- `status` - статус участника (ENUM: 'активный', 'участник', 'новый', 'неактивный')
- `message_count` - количество сообщений (INT, DEFAULT 0)
- `photo_url` - URL фотографии профиля (VARCHAR(500), NULL)
- `created_at` - дата создания записи (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` - дата обновления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Используется в API:**
- `GET /api.php?action=members` - получение всех участников
- `POST /api.php?action=verify_user` - проверка статуса пользователя

### 2. 🚗 Таблица `cars` (Автомобили)

**Обязательные поля:**
- `id` - уникальный идентификатор (PRIMARY KEY, AUTO_INCREMENT)
- `member_id` - ID владельца (FOREIGN KEY → members.id)
- `brand` - марка автомобиля (VARCHAR(100))
- `model` - модель (VARCHAR(100))
- `year` - год выпуска (INT)
- `reg_number` - регистрационный номер (VARCHAR(20), UNIQUE)
- `color` - цвет (VARCHAR(50))
- `engine_volume` - объем двигателя (VARCHAR(10))
- `photos` - фотографии в JSON формате (TEXT, NULL)
- `created_at` - дата добавления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` - дата обновления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Используется в API:**
- `GET /api.php?action=cars` - получение всех автомобилей с информацией о владельцах

### 3. 📨 Таблица `invitations` (Приглашения)

**Обязательные поля:**
- `id` - уникальный идентификатор (PRIMARY KEY, AUTO_INCREMENT)
- `car_id` - ID автомобиля (FOREIGN KEY → cars.id, NULL)
- `inviter_member_id` - ID пригласившего (FOREIGN KEY → members.id, NULL)
- `invitation_date` - дата приглашения (DATE)
- `location` - место приглашения (VARCHAR(200))
- `status` - статус (ENUM: 'приглашение', 'вступил в клуб', 'отклонено')
- `photos` - фотографии в JSON формате (TEXT, NULL)
- `created_at` - дата создания (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` - дата обновления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Используется в API:**
- `GET /api.php?action=invitations` - получение всех приглашений

### 4. 🎉 Таблица `events` (События клуба)

**Обязательные поля:**
- `id` - уникальный идентификатор (PRIMARY KEY, AUTO_INCREMENT)
- `title` - название события (VARCHAR(200))
- `description` - описание (TEXT)
- `event_date` - дата события (DATE)
- `event_time` - время события (TIME)
- `location` - место проведения (VARCHAR(300))
- `city` - город (VARCHAR(100))
- `type` - тип события (ENUM: 'заезд', 'встреча', 'фотосессия', 'техническая встреча')
- `status` - статус (ENUM: 'запланировано', 'проводится', 'завершено', 'отменено')
- `organizer_id` - ID организатора (FOREIGN KEY → members.id)
- `participants_count` - количество участников (INT, DEFAULT 0)
- `max_participants` - максимум участников (INT, NULL)
- `price` - стоимость участия (DECIMAL(10,2), DEFAULT 0)
- `photos` - фотографии в JSON формате (TEXT, NULL)
- `created_at` - дата создания (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` - дата обновления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Используется в интерфейсе:**
- Раздел "События" с фильтрацией по городу, типу, статусу

### 5. 🔧 Таблица `services` (Сервисы)

**Обязательные поля:**
- `id` - уникальный идентификатор (PRIMARY KEY, AUTO_INCREMENT)
- `name` - название сервиса (VARCHAR(200))
- `description` - описание услуг (TEXT)
- `city` - город (VARCHAR(100))
- `address` - адрес (VARCHAR(300))
- `phone` - телефон (VARCHAR(20), NULL)
- `website` - сайт (VARCHAR(200), NULL)
- `type` - тип услуг (ENUM: 'автосервис', 'детейлинг', 'шиномонтаж', 'тюнинг', 'страхование')
- `recommendation` - рекомендация (ENUM: 'рекомендуется', 'не рекомендуется', 'нейтрально')
- `rating` - рейтинг (DECIMAL(2,1), NULL) - от 1.0 до 5.0
- `price_range` - ценовой диапазон (ENUM: 'низкий', 'средний', 'высокий')
- `working_hours` - часы работы (VARCHAR(100), NULL)
- `photos` - фотографии в JSON формате (TEXT, NULL)
- `added_by_member_id` - кто добавил (FOREIGN KEY → members.id, NULL)
- `created_at` - дата добавления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` - дата обновления (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Используется в интерфейсе:**
- Раздел "Сервисы" с фильтрацией по городу, типу, рекомендациям

## 📈 Статистика (вычисляется из данных)

API endpoint `GET /api.php?action=stats` возвращает:
- `total_members` - общее количество участников
- `active_members` - активные участники (status = 'активный')
- `total_cars` - общее количество автомобилей
- `pending_invitations` - ожидающие приглашения (status = 'приглашение')
- `successful_invitations` - успешные приглашения (status = 'вступил в клуб')
- `upcoming_events` - предстоящие события
- `recommended_services` - рекомендуемые сервисы

## 🔐 Авторизация через Telegram

### Текущая реализация:
- В `config.php` есть настройки бота: `BOT_TOKEN`, `CHAT_ID`, `ADMIN_IDS`
- Функция `verifyTelegramAuth()` для проверки подписи данных от Telegram
- API endpoint `verify_user` проверяет статус пользователя по `telegram_id`

### Что нужно для полной реализации:
1. **Telegram Bot** - создать бота через @BotFather
2. **Webhook или Polling** - для получения сообщений от пользователей
3. **Login Widget** - кнопка "Войти через Telegram" на фронтенде
4. **Проверка подписи** - валидация данных от Telegram (уже есть)
5. **Сессии** - хранение авторизованных пользователей

### Сложность реализации: ⭐⭐⭐ (средняя)
- Telegram API хорошо документирован
- Основа уже есть в коде
- Нужно настроить бота и интеграцию с фронтендом

## 📁 Файловая структура для загрузок

Согласно `config.php`:
- `uploads/members/` - фотографии участников
- `uploads/cars/` - фотографии автомобилей

## 🚀 Следующие шаги

1. **Создать SQL скрипты** для создания таблиц
2. **Заполнить тестовыми данными** из JavaScript заглушек
3. **Настроить Telegram Bot**
4. **Протестировать API endpoints**
5. **Настроить загрузку файлов** 