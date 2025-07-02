# Админские права в CabrioRide

## Обзор

В системе CabrioRide реализована система админских прав, которая позволяет администраторам управлять любыми записями в системе.

## Как работает система прав

### Поле isAdmin
- В таблице `members` добавлено поле `isAdmin` типа BOOLEAN
- По умолчанию все пользователи имеют `isAdmin = FALSE`
- Админы имеют `isAdmin = TRUE`

### Логика проверки прав
При редактировании/удалении записей система проверяет:
1. **Обычные пользователи**: могут редактировать только свои записи
2. **Админы**: могут редактировать любые записи

Формула проверки: `isOwner = (member_id == current_user.member_id) || current_user.isAdmin`

## Что могут админы

### Автомобили
- ✅ Редактировать любые автомобили
- ✅ Удалять любые автомобили
- ✅ Просматривать все данные

### Приглашения
- ✅ Редактировать любые приглашения
- ✅ Удалять любые приглашения
- ✅ Просматривать все данные

### События
- ✅ Редактировать любые события
- ✅ Удалять любые события
- ✅ Просматривать все данные

### Сервисы
- ✅ Редактировать любые сервисы
- ✅ Удалять любые сервисы
- ✅ Просматривать все данные

## Настройка админов

### Добавление поля isAdmin
```sql
-- Добавить поле в существующую таблицу
ALTER TABLE `members` 
ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT FALSE 
AFTER `status`;

-- Добавить индекс
CREATE INDEX `idx_members_isAdmin` ON `members` (`isAdmin`);
```

### Назначение админа
```sql
-- Назначить пользователя админом по telegram_id
UPDATE `members` SET `isAdmin` = TRUE WHERE `telegram_id` = 123456789;

-- Снять права админа
UPDATE `members` SET `isAdmin` = FALSE WHERE `telegram_id` = 123456789;
```

### Просмотр админов
```sql
-- Список всех админов
SELECT id, first_name, last_name, nickname, telegram_id 
FROM members 
WHERE isAdmin = TRUE;

-- Количество админов
SELECT COUNT(*) as admin_count FROM members WHERE isAdmin = TRUE;
```

## Техническая реализация

### Frontend (JavaScript)
```javascript
// Проверка прав в карточках
const isOwner = this.currentUser && (
    car.member_id == this.currentUser.member_id || 
    this.currentUser.isAdmin
);

// Отображение кнопки редактирования
${isOwner ? `<button class="edit-btn">✏️</button>` : ''}
```

### Backend (PHP)
```php
// Проверка прав в API
$stmt = $pdo->prepare("SELECT m.id, m.isAdmin FROM members m WHERE m.telegram_id = ?");
$stmt->execute([$telegramId]);
$member = $stmt->fetch();

if (!$member['isAdmin'] && $car['member_id'] != $member['id']) {
    sendError('Access denied: you can only edit your own records');
}
```

## Безопасность

- Проверка прав происходит как на фронтенде, так и на бэкенде
- Бэкенд проверка является основной защитой
- Фронтенд проверка улучшает UX (скрывает кнопки)
- Все API endpoints проверяют права доступа

## Рекомендации

1. **Минимальное количество админов**: назначайте админами только доверенных пользователей
2. **Регулярный аудит**: периодически проверяйте список админов
3. **Логирование**: в будущем можно добавить логирование действий админов
4. **Градация прав**: в будущем можно добавить разные уровни прав (модератор, суперадмин и т.д.) 