<?php
/**
 * Простой тест API для отладки
 */

// Включаем отображение ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🧪 Тест API</h1>";

// Тест 1: Проверка подключения к БД
echo "<h2>1. Тест подключения к БД</h2>";
try {
    require_once '../backend/config.php';
    define('API_ACCESS', true);
    
    $pdo = getDbConnection();
    echo "✅ Подключение к БД успешно<br>";
    
    // Проверяем таблицы
    $tables = ['members', 'cars', 'invitations'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Таблица $table существует<br>";
        } else {
            echo "❌ Таблица $table не найдена<br>";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Ошибка БД: " . $e->getMessage() . "<br>";
}

// Тест 2: Проверка API endpoint
echo "<h2>2. Тест API endpoint</h2>";
try {
    // Симулируем POST запрос
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_GET['action'] = 'check_car_number';
    
    // Создаем тестовые данные
    $testData = json_encode(['reg_number' => '70MX']);
    
    // Сохраняем оригинальный input stream
    $originalInput = file_get_contents('php://input');
    
    // Создаем временный файл с тестовыми данными
    $tempFile = tmpfile();
    fwrite($tempFile, $testData);
    rewind($tempFile);
    
    // Перенаправляем stdin
    $originalStdin = STDIN;
    define('STDIN', $tempFile);
    
    // Запускаем API
    ob_start();
    include '../backend/api.php';
    $output = ob_get_clean();
    
    echo "📋 Вывод API:<br>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
    // Восстанавливаем stdin
    fclose($tempFile);
    
} catch (Exception $e) {
    echo "❌ Ошибка API: " . $e->getMessage() . "<br>";
}

// Тест 3: Прямой запрос к БД
echo "<h2>3. Прямой запрос к БД</h2>";
try {
    $pdo = getDbConnection();
    
    // Проверяем машины
    $stmt = $pdo->prepare("
        SELECT c.reg_number, m.status as member_status
        FROM cars c
        JOIN members m ON c.member_id = m.id
        WHERE REPLACE(UPPER(c.reg_number), ' ', '') LIKE UPPER(?)
          AND m.status IN ('активный', 'участник', 'новый')
        LIMIT 1
    ");
    $stmt->execute(['%70MX%']);
    $memberCar = $stmt->fetch();
    
    if ($memberCar) {
        echo "✅ Найдена машина участника:<br>";
        echo "- Номер: " . $memberCar['reg_number'] . "<br>";
        echo "- Статус: " . $memberCar['member_status'] . "<br>";
    } else {
        echo "❌ Машина участника не найдена<br>";
    }
    
    // Проверяем приглашения
    $stmt = $pdo->prepare("
        SELECT i.car_number, i.status as invitation_status
        FROM invitations i
        WHERE REPLACE(UPPER(i.car_number), ' ', '') LIKE UPPER(?)
          AND i.status IN ('новое', 'на связи', 'встреча назначена', 'вступил в клуб')
        LIMIT 1
    ");
    $stmt->execute(['%70MX%']);
    $invitation = $stmt->fetch();
    
    if ($invitation) {
        echo "✅ Найдено приглашение:<br>";
        echo "- Номер: " . $invitation['car_number'] . "<br>";
        echo "- Статус: " . $invitation['invitation_status'] . "<br>";
    } else {
        echo "❌ Приглашение не найдено<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Ошибка запроса: " . $e->getMessage() . "<br>";
}

echo "<h2>✅ Тест завершен</h2>";
?> 