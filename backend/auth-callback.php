<?php
/**
 * Telegram Login Widget Callback Handler
 * Обрабатывает авторизацию пользователей через Telegram
 */

define('API_ACCESS', true);
require_once 'config.php';

// Устанавливаем заголовки для JSON API если это POST запрос
$isApiRequest = $_SERVER['REQUEST_METHOD'] === 'POST';
if ($isApiRequest) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Обрабатываем preflight запросы
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Логирование для отладки
function logAuth($message, $data = null) {
    $logEntry = date('Y-m-d H:i:s') . " - " . $message;
    if ($data) {
        $logEntry .= " - " . json_encode($data);
    }
    error_log($logEntry . "\n", 3, 'auth.log');
}

// Функция для отправки JSON ответа
function sendJsonResponse($success, $data = null, $error = null) {
    $response = ['success' => $success];
    if ($data) $response = array_merge($response, $data);
    if ($error) $response['error'] = $error;
    
    echo json_encode($response);
    exit;
}

// Функция для редиректа (для GET запросов)
function redirectWithError($error, $data = null) {
    if ($data) {
        $errorData = ['error' => $error] + $data;
        header('Location: ../index.html?error=' . urlencode(json_encode($errorData)));
    } else {
        header('Location: ../index.html?error=' . $error);
    }
    exit;
}

try {
    // Получаем данные в зависимости от типа запроса
    if ($isApiRequest) {
        // POST запрос - данные из тела запроса
        $input = file_get_contents('php://input');
        parse_str($input, $auth_data);
        logAuth("API Auth attempt (POST)", $auth_data);
    } else {
        // GET запрос - данные из URL
        $auth_data = $_GET;
        logAuth("Widget Auth attempt (GET)", $auth_data);
    }
    
    // Проверяем обязательные поля (поддерживаем разные форматы)
    if (empty($auth_data) || (!isset($auth_data['id']) && !isset($auth_data['user_id'])) || !isset($auth_data['hash'])) {
        logAuth("Missing required fields", $auth_data);
        
        if ($isApiRequest) {
            sendJsonResponse(false, null, 'Отсутствуют обязательные параметры авторизации');
        } else {
            redirectWithError('invalid_data');
        }
    }
    
    // Нормализуем данные - поддерживаем как id, так и user_id
    if (isset($auth_data['user_id']) && !isset($auth_data['id'])) {
        $auth_data['id'] = $auth_data['user_id'];
    }
    
    // Проверяем подпись от Telegram
    if (!verifyTelegramAuth($auth_data)) {
        logAuth("Invalid signature", $auth_data);
        
        if ($isApiRequest) {
            sendJsonResponse(false, null, 'Неверная подпись данных от Telegram');
        } else {
            redirectWithError('invalid_signature');
        }
    }
    
    // Проверяем время жизни данных (поддерживаем разные форматы)
    $auth_date = 0;
    if (isset($auth_data['auth_date'])) {
        $auth_date = intval($auth_data['auth_date']);
    } elseif (isset($auth_data['timestamp'])) {
        $auth_date = intval($auth_data['timestamp']);
    }
    
    // Для мобильных ссылок время может быть более коротким (10 минут)
    $max_age = isset($auth_data['timestamp']) || isset($auth_data['mobile']) ? 600 : 86400; // 10 мин для timestamp, 24 часа для auth_date
    
    if ($auth_date === 0 || (time() - $auth_date) > $max_age) {
        logAuth("Expired auth data", [
            'auth_date' => $auth_date, 
            'current_time' => time(), 
            'age' => time() - $auth_date,
            'max_age' => $max_age
        ]);
        
        if ($isApiRequest) {
            sendJsonResponse(false, null, 'Ссылка авторизации устарела');
        } else {
            redirectWithError('expired_data');
        }
    }
    
    // Проверяем пользователя в базе данных
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM members WHERE telegram_id = ?");
    $stmt->execute([$auth_data['id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        logAuth("User not found in database", ['telegram_id' => $auth_data['id']]);
        
        if ($isApiRequest) {
            sendJsonResponse(false, null, 'Пользователь не найден в базе данных клуба');
        } else {
            // Пользователь не найден - перенаправляем с ошибкой
            $errorData = [
                'telegram_id' => $auth_data['id'],
                'first_name' => $auth_data['first_name'] ?? '',
                'last_name' => $auth_data['last_name'] ?? '',
                'username' => $auth_data['username'] ?? ''
            ];
            redirectWithError('user_not_found', $errorData);
        }
    }
    
    // Проверяем статус пользователя
    if ($user['status'] !== 'активный') {
        $statusMessages = [
            'участник' => 'Ваш статус: "Участник". Для получения полного доступа необходимо стать активным участником клуба.',
            'новый' => 'Ваш статус: "Новый участник". Для получения доступа необходимо пройти процедуру активации.',
            'вышел' => 'Ваш статус: "Вышел из клуба". Доступ к контенту заблокирован.',
            'заблокирован' => 'Ваш статус: "Заблокирован". Обратитесь к администратору клуба.',
            'неактивный' => 'Ваш статус: "Неактивный". Доступ к контенту заблокирован.'
        ];
        
        $message = $statusMessages[$user['status']] ?? 'Ваш статус не позволяет получить доступ к сайту.';
        
        if ($isApiRequest) {
            sendJsonResponse(false, [
                'access' => false,
                'status' => $user['status'],
                'message' => $message
            ]);
        } else {
            echo "<script>
                alert('$message');
                window.close();
            </script>";
        }
        exit;
    }
    
    // Обновляем информацию о пользователе из Telegram (если изменилась)
    $updateData = [];
    $updateParams = [];
    
    if (isset($auth_data['first_name']) && $auth_data['first_name'] !== $user['name']) {
        $updateData[] = "name = ?";
        $updateParams[] = $auth_data['first_name'] . ' ' . ($auth_data['last_name'] ?? '');
    }
    
    if (isset($auth_data['username']) && $auth_data['username'] !== $user['telegram_username']) {
        $updateData[] = "telegram_username = ?";
        $updateParams[] = $auth_data['username'];
    }
    
    if (!empty($updateData)) {
        $updateParams[] = $auth_data['id'];
        $sql = "UPDATE members SET " . implode(', ', $updateData) . ", updated_at = NOW() WHERE telegram_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($updateParams);
        logAuth("User info updated", $updateParams);
    }
    
    // Обновляем время последнего входа
    $stmt = $pdo->prepare("UPDATE members SET last_login = NOW() WHERE telegram_id = ?");
    $stmt->execute([$auth_data['id']]);
    
    logAuth("Successful login", [
        'user_id' => $user['id'],
        'telegram_id' => $auth_data['id'],
        'name' => $user['name']
    ]);
    
    // Подготавливаем данные для фронтенда
    $userData = [
        'id' => $auth_data['id'],
        'first_name' => $user['first_name'] ?? $user['name'] ?? 'Пользователь',
        'last_name' => $user['last_name'] ?? '',
        'username' => $user['telegram_username'] ?? '',
        'photo_url' => null, // Фото пока не используем
        'status' => $user['status'],
        'member_id' => $user['id']
    ];
    
    if ($isApiRequest) {
        // JSON ответ для API
        sendJsonResponse(true, [
            'user' => $userData,
            'token' => 'auth_' . $auth_data['id'] . '_' . time()
        ]);
    } else {
        // Перенаправление для виджета
        header('Location: ../index.html?auth=' . urlencode(json_encode($userData)));
        exit;
    }
    
} catch (PDOException $e) {
    logAuth("Database error: " . $e->getMessage());
    error_log("Auth database error: " . $e->getMessage());
    
    if ($isApiRequest) {
        sendJsonResponse(false, null, 'Ошибка базы данных');
    } else {
        redirectWithError('database_error');
    }
    
} catch (Exception $e) {
    logAuth("General error: " . $e->getMessage());
    error_log("Auth general error: " . $e->getMessage());
    
    if ($isApiRequest) {
        sendJsonResponse(false, null, 'Внутренняя ошибка сервера');
    } else {
        redirectWithError('general_error');
    }
}
?> 