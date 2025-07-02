<?php
/**
 * Cabrio Club Dashboard - Database Configuration
 * Contains database connection settings and API configuration
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access forbidden');
}

// Database Configuration
// define('DB_HOST', 'localhost');
define('DB_HOST', 'mysql80.hostland.ru');
define('DB_USER', 'host1708875_cabrio');
define('DB_PASSWORD', 'Protokol911');
define('DB_NAME', 'host1708875_cabrio');

// Telegram Bot Configuration
define('BOT_TOKEN', '7977510391:AAGgnVVDu_YPHCo7gQTOUnvExfk3surVLl0');
define('BOT_NAME', 'Cabrio_Ride_bot');
define('CHAT_ID', '-1002873258290');
define('ADMIN_IDS', '287536885'); 

// URL Paths for Photos
define('PHOTOS_MEMBERS_URL', 'uploads/members/');
define('PHOTOS_CARS_URL', 'uploads/cars/');
define('PHOTOS_EVENTS_URL', 'uploads/events/');
define('PHOTOS_SERVICES_URL', 'uploads/services/');

// API Configuration
define('API_VERSION', '1.0');
define('API_TIMEZONE', 'Europe/Moscow');

// Security Settings
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_ATTEMPT_WINDOW', 900); // 15 minutes

// Error Reporting - отключаем для продакшена
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set timezone
if (function_exists('date_default_timezone_set')) {
    date_default_timezone_set(API_TIMEZONE);
}

/**
 * Database Connection Function
 */
function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            die(json_encode(['success' => false, 'error' => 'Database connection failed']));
        }
    }
    
    return $pdo;
}

/**
 * Telegram Bot Helper Functions
 */
function verifyTelegramAuth($auth_data) {
    if (!isset($auth_data['hash'])) {
        return false;
    }
    
    $check_hash = $auth_data['hash'];
    unset($auth_data['hash']);
    
    $data_check_arr = [];
    foreach ($auth_data as $key => $value) {
        $data_check_arr[] = $key . '=' . $value;
    }
    sort($data_check_arr);
    
    $data_check_string = implode("\n", $data_check_arr);
    $secret_key = hash('sha256', BOT_TOKEN, true);
    $hash = hash_hmac('sha256', $data_check_string, $secret_key);
    
    return strcmp($hash, $check_hash) === 0;
}

/**
 * Security Helper Functions
 */
function sanitizeInput($input) {
    if (is_string($input)) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    return $input;
}

function isValidUserId($user_id) {
    return is_numeric($user_id) && $user_id > 0;
}

/**
 * Logging Function
 */
function logApiCall($action, $user_id = null, $details = null) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'user_id' => $user_id,
        'ip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown',
        'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'unknown',
        'details' => $details
    ];
    
    error_log("API_LOG: " . json_encode($log_entry, JSON_UNESCAPED_UNICODE));
}

/**
 * Response Helper Functions
 */
function sendJsonResponse($data, $http_code = 200) {
    http_response_code($http_code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function sendError($message, $http_code = 400) {
    sendJsonResponse(['success' => false, 'error' => $message], $http_code);
}

function sendSuccess($data = null, $message = null) {
    $response = ['success' => true];
    if ($data !== null) $response['data'] = $data;
    if ($message !== null) $response['message'] = $message;
    sendJsonResponse($response);
}
?>