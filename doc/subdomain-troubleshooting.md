# 🌐 Устранение проблем с поддоменом club.cabrioride.by

## 🎯 Проблема
Сайт не загружается на поддомене `https://club.cabrioride.by/`

## 🔍 Диагностика

### Шаг 1: Проверка базовой работы PHP
Откройте: `https://club.cabrioride.by/backend/domain-test.php`

Этот скрипт покажет:
- ✅ Работает ли PHP на поддомене
- 📊 Информацию о сервере
- 📁 Какие файлы загружены
- ⚙️ Состояние .htaccess
- 🔧 Доступные модули Apache

### Шаг 2: Простейший тест
Если domain-test.php не работает, попробуйте:
`https://club.cabrioride.by/backend/phptest.php`

## 🔧 Возможные причины проблем

### 1. ❌ Проблемы с .htaccess
**Симптомы**: Internal Server Error 500
**Причины**: 
- Слишком строгие правила в .htaccess
- Неподдерживаемые директивы
- Конфликт с настройками сервера

**Решения**:
1. **Временно переименуйте .htaccess** в .htaccess-backup
2. **Используйте упрощенную версию** (.htaccess-optimized)
3. **Проверьте логи ошибок** сервера

### 2. ❌ Неправильная настройка поддомена
**Симптомы**: 404 Not Found или сайт не открывается
**Причины**:
- Поддомен не настроен в DNS
- Неправильный Document Root
- Проблемы с хостингом

**Решения**:
1. Проверьте настройки DNS для club.cabrioride.by
2. Убедитесь что поддомен указывает на правильную папку
3. Свяжитесь с поддержкой хостинга

### 3. ❌ Отсутствие SSL сертификата
**Симптомы**: "Не удается установить безопасное соединение"
**Причины**:
- SSL сертификат не настроен для поддомена
- Неправильная конфигурация HTTPS

**Решения**:
1. Настройте SSL для club.cabrioride.by
2. Используйте Let's Encrypt (бесплатно)
3. Временно тестируйте по HTTP

### 4. ❌ Неправильные права доступа
**Симптомы**: 403 Forbidden
**Причины**:
- Неправильные права на файлы/папки
- Отсутствует index.html

**Решения**:
```bash
# Установить правильные права
chmod 755 папки/
chmod 644 файлы.php
chmod 644 файлы.html
```

### 5. ❌ Проблемы с загрузкой файлов
**Симптомы**: Отдельные файлы не загружаются
**Причины**:
- Файлы не загружены на сервер
- Неправильная структура папок

## 🚀 Пошаговое решение

### Шаг 1: Проверьте базовую работу
```
https://club.cabrioride.by/backend/domain-test.php
```

### Шаг 2: Если не работает - упростите .htaccess
1. Переименуйте `.htaccess` в `.htaccess-backup`
2. Скопируйте содержимое `.htaccess-optimized` в новый `.htaccess`
3. Проверьте снова

### Шаг 3: Проверьте структуру файлов
Убедитесь что загружены все файлы:
```
/club/
├── index.html          ← Главная страница
├── css/style.css       ← Стили
├── js/app.js          ← JavaScript
├── js/data.js         ← Данные
├── backend/           ← PHP файлы
├── uploads/           ← Папка загрузок
└── .htaccess          ← Конфигурация
```

### Шаг 4: Тестируйте по частям
1. `https://club.cabrioride.by/backend/phptest.php` - PHP работает?
2. `https://club.cabrioride.by/index.html` - HTML загружается?
3. `https://club.cabrioride.by/css/style.css` - CSS доступен?
4. `https://club.cabrioride.by/backend/api.php?action=stats` - API работает?

## 🔧 Быстрые исправления

### Исправление 1: Минимальный .htaccess
Создайте простейший .htaccess:
```apache
RewriteEngine On
AddDefaultCharset UTF-8
Options -Indexes
```

### Исправление 2: Проверка index.html
Убедитесь что index.html в корне поддомена:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Сайт работает!</h1></body>
</html>
```

### Исправление 3: Проверка PHP
Создайте test.php:
```php
<?php echo "PHP работает на поддомене!"; ?>
```

## 🌐 Специфика поддомена club.cabrioride.by

### DNS настройки
Убедитесь что в DNS есть запись:
```
club.cabrioride.by  A  IP_АДРЕС_СЕРВЕРА
```

### SSL сертификат
Для Telegram авторизации ОБЯЗАТЕЛЬНО нужен SSL:
1. Настройте Let's Encrypt
2. Или купите SSL сертификат
3. Убедитесь что сертификат покрывает поддомен

### Настройки хостинга
В панели управления хостингом:
1. Создайте поддомен `club`
2. Укажите папку `/htdocs/club/`
3. Включите SSL для поддомена

## 📋 Чек-лист диагностики

- [ ] Поддомен настроен в DNS
- [ ] Поддомен настроен в панели хостинга
- [ ] SSL сертификат установлен
- [ ] Все файлы загружены на сервер
- [ ] Права доступа настроены правильно
- [ ] .htaccess не вызывает ошибок
- [ ] PHP работает
- [ ] index.html открывается
- [ ] API отвечает

## 💡 Рекомендации

### Для разработки:
1. Начните с HTTP (без SSL)
2. Используйте минимальный .htaccess
3. Тестируйте по частям

### Для продакшена:
1. Обязательно настройте SSL
2. Используйте полный .htaccess с безопасностью
3. Настройте мониторинг

## 📞 Если ничего не помогает

1. **Проверьте логи ошибок** в панели хостинга
2. **Свяжитесь с поддержкой** хостинга
3. **Попробуйте другой поддомен** для теста
4. **Проверьте квоты** дискового пространства

## 🎯 Ожидаемый результат

После исправления должно работать:
- `https://club.cabrioride.by/` - главная страница
- `https://club.cabrioride.by/backend/domain-test.php` - диагностика
- `https://club.cabrioride.by/backend/api.php?action=stats` - API

---

**Начните с domain-test.php - он покажет все проблемы сразу!** 