<?php
/**
 * Cabrio Club Dashboard - Main API Endpoint
 * Handles all API requests for the dashboard
 */

// Security check
define('API_ACCESS', true);

// Include configuration
require_once 'config.php';

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Get action parameter
    $action = $_GET['action'] ?? '';
    
    if (empty($action)) {
        sendError('Action parameter is required');
    }
    
    // Log API call
    logApiCall($action, null, $_SERVER['REQUEST_URI']);
    
    // Route to appropriate handler
    switch ($action) {
        case 'stats':
            handleStatsRequest();
            break;
            
        case 'members':
            handleMembersRequest();
            break;
            
        case 'cars':
            handleCarsRequest();
            break;
            
        case 'invitations':
            handleInvitationsRequest();
            break;
            
        case 'events':
            handleEventsRequest();
            break;
            
        case 'services':
            handleServicesRequest();
            break;
            
        case 'add_car':
            handleAddCarRequest();
            break;
            
        case 'add_invitation':
            handleAddInvitationRequest();
            break;
            
        case 'add_event':
            handleAddEventRequest();
            break;
            
        case 'add_service':
            handleAddServiceRequest();
            break;
            
        case 'update_profile':
            handleUpdateProfileRequest();
            break;
            
        case 'get_member_id':
            handleGetMemberIdRequest();
            break;
            
        case 'update_car':
            handleUpdateCarRequest();
            break;
            
        case 'delete_car':
            handleDeleteCarRequest();
            break;
            
        case 'verify_user':
            handleVerifyUserRequest();
            break;
            
        case 'check_car_number':
            handleCheckCarNumberRequest();
            break;
            
        default:
            sendError('Unknown action: ' . $action, 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}

/**
 * Handle statistics request
 */
function handleStatsRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get total members count
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM members");
        $totalMembers = $stmt->fetch()['total'];
        
        // Get active members count
        $stmt = $pdo->query("SELECT COUNT(*) as active FROM members WHERE status = 'активный'");
        $activeMembers = $stmt->fetch()['active'];
        
        // Get total cars count
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM cars");
        $totalCars = $stmt->fetch()['total'];
        
        // Get pending invitations count
        $stmt = $pdo->query("SELECT COUNT(*) as pending FROM invitations WHERE status IN ('новое', 'на связи', 'встреча назначена')");
        $pendingInvitations = $stmt->fetch()['pending'];
        
        // Get successful invitations count
        $stmt = $pdo->query("SELECT COUNT(*) as successful FROM invitations WHERE status = 'вступил в клуб'");
        $successfulInvitations = $stmt->fetch()['successful'];
        
        // Get events statistics
        $upcomingEvents = 0;
        $totalEvents = 0;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as upcoming FROM events WHERE status = 'запланировано' AND event_date >= CURDATE()");
            $upcomingEvents = $stmt->fetch()['upcoming'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM events");
            $totalEvents = $stmt->fetch()['total'];
        } catch (PDOException $e) {
            // Таблица events может не существовать
        }
        
        // Get services statistics
        $recommendedServices = 0;
        $totalServices = 0;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as recommended FROM services WHERE recommendation = 'рекомендуется'");
            $recommendedServices = $stmt->fetch()['recommended'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM services");
            $totalServices = $stmt->fetch()['total'];
        } catch (PDOException $e) {
            // Таблица services может не существовать
        }

        $stats = [
            'total_members' => (int)$totalMembers,
            'active_members' => (int)$activeMembers,
            'total_cars' => (int)$totalCars,
            'pending_invitations' => (int)$pendingInvitations,
            'successful_invitations' => (int)$successfulInvitations,
            'upcoming_events' => (int)$upcomingEvents,
            'total_events' => (int)$totalEvents,
            'recommended_services' => (int)$recommendedServices,
            'total_services' => (int)$totalServices
        ];
        
        sendSuccess($stats);
        
    } catch (PDOException $e) {
        error_log("Stats query error: " . $e->getMessage());
        sendError('Failed to retrieve statistics');
    }
}

/**
 * Handle members request
 */
function handleMembersRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get members with their cars
        $stmt = $pdo->query("
            SELECT 
                m.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', c.id,
                        'brand', c.brand,
                        'model', c.model,
                        'year', c.year,
                        'reg_number', c.reg_number,
                        'color', c.color,
                        'engine_volume', c.engine_volume,
                        'photos', c.photos
                    )
                ) as cars_json
            FROM members m
            LEFT JOIN cars c ON m.id = c.member_id AND c.status IN ('активный', 'в клубе')
            WHERE m.status IN ('активный', 'участник', 'новый', 'без авто')
            GROUP BY m.id
            ORDER BY m.join_date DESC
        ");
        
        $members = [];
        while ($row = $stmt->fetch()) {
            // Parse cars JSON
            $cars = [];
            if ($row['cars_json']) {
                $carsData = explode(',{', $row['cars_json']);
                foreach ($carsData as $i => $carJson) {
                    if ($i > 0) $carJson = '{' . $carJson;
                    $car = json_decode($carJson, true);
                    if ($car && $car['id']) {
                        // Process car photos
                        if ($car['photos']) {
                            $photos = json_decode($car['photos'], true);
                            if ($photos && is_array($photos)) {
                                $car['photos'] = json_encode(array_map(function($photo) {
                                    // Проверяем, не добавлен ли уже путь
                                    if (strpos($photo, 'uploads/') !== 0 && strpos($photo, 'http') !== 0) {
                                        return PHOTOS_CARS_URL . $photo;
                                    }
                                    return $photo;
                                }, $photos));
                            }
                        }
                        $cars[] = $car;
                    }
                }
            }
            
            // Process photo URL
            if ($row['photo_url']) {
                // Проверяем, не добавлен ли уже путь
                if (strpos($row['photo_url'], 'uploads/') !== 0 && strpos($row['photo_url'], 'http') !== 0) {
                    $row['photo_url'] = PHOTOS_MEMBERS_URL . $row['photo_url'];
                }
            }
            
            unset($row['cars_json']);
            $row['cars'] = $cars;
            
            $members[] = $row;
        }
        
        sendSuccess($members);
        
    } catch (PDOException $e) {
        error_log("Members query error: " . $e->getMessage());
        sendError('Failed to retrieve members');
    }
}

/**
 * Handle cars request
 */
function handleCarsRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get cars with owner information
        $stmt = $pdo->query("
            SELECT 
                c.*,
                CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) as owner_name,
                m.nickname as owner_nickname
            FROM cars c
            LEFT JOIN members m ON c.member_id = m.id
            WHERE c.status IN ('активный', 'в клубе', 'на модерации')
            ORDER BY c.created_at DESC
        ");
        
        $cars = [];
        while ($row = $stmt->fetch()) {
            // Process photos
            if ($row['photos']) {
                $photos = json_decode($row['photos'], true);
                if ($photos && is_array($photos)) {
                    $row['photos'] = json_encode(array_map(function($photo) {
                        // Проверяем, не добавлен ли уже путь
                        if (strpos($photo, 'uploads/') !== 0 && strpos($photo, 'http') !== 0) {
                            return PHOTOS_CARS_URL . $photo;
                        }
                        return $photo;
                    }, $photos));
                }
            }
            
            $cars[] = $row;
        }
        
        sendSuccess($cars);
        
    } catch (PDOException $e) {
        error_log("Cars query error: " . $e->getMessage());
        sendError('Failed to retrieve cars');
    }
}

/**
 * Handle invitations request
 */
function handleInvitationsRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get invitations with car and inviter information
        $stmt = $pdo->query("
            SELECT 
                i.*,
                c.brand as car_brand,
                c.model as car_model,
                c.reg_number as car_reg_number,
                CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) as inviter_name,
                m.nickname as inviter_nickname
            FROM invitations i
            LEFT JOIN cars c ON i.car_id = c.id
            LEFT JOIN members m ON i.inviter_member_id = m.id
            ORDER BY i.invitation_date DESC
        ");
        
        $invitations = [];
        while ($row = $stmt->fetch()) {
            // Process photos
            if ($row['photos']) {
                $photos = json_decode($row['photos'], true);
                if ($photos && is_array($photos)) {
                    $row['photos'] = json_encode(array_map(function($photo) {
                        // Проверяем, не добавлен ли уже путь
                        if (strpos($photo, 'uploads/') !== 0 && strpos($photo, 'http') !== 0) {
                            return PHOTOS_CARS_URL . $photo;
                        }
                        return $photo;
                    }, $photos));
                }
            }
            
            $invitations[] = $row;
        }
        
        sendSuccess($invitations);
        
    } catch (PDOException $e) {
        error_log("Invitations query error: " . $e->getMessage());
        sendError('Failed to retrieve invitations');
    }
}

/**
 * Handle events request
 */
function handleEventsRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get events with organizer information
        $stmt = $pdo->query("
            SELECT 
                e.*,
                CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) as organizer_name,
                m.nickname as organizer_nickname
            FROM events e
            LEFT JOIN members m ON e.organizer_id = m.id
            ORDER BY e.event_date DESC, e.created_at DESC
        ");
        
        $events = [];
        while ($row = $stmt->fetch()) {
            // Process photos
            if ($row['photos']) {
                $photos = json_decode($row['photos'], true);
                if ($photos && is_array($photos)) {
                    $row['photos'] = json_encode(array_map(function($photo) {
                        if (!$photo || strpos($photo, 'http') === 0) {
                            return $photo; // Уже полный URL или пустое
                        }
                        return PHOTOS_EVENTS_URL . $photo;
                    }, $photos));
                }
            }
            
            $events[] = $row;
        }
        
        sendSuccess($events);
        
    } catch (PDOException $e) {
        error_log("Events query error: " . $e->getMessage());
        sendError('Failed to retrieve events');
    }
}

/**
 * Handle services request
 */
function handleServicesRequest() {
    $pdo = getDbConnection();
    
    try {
        // Get services with added_by member information
        $stmt = $pdo->query("
            SELECT 
                s.*,
                CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) as added_by_name,
                m.nickname as added_by_nickname
            FROM services s
            LEFT JOIN members m ON s.added_by_member_id = m.id
            ORDER BY s.recommendation DESC, s.rating DESC, s.created_at DESC
        ");
        
        $services = [];
        while ($row = $stmt->fetch()) {
            // Process photos
            if ($row['photos']) {
                $photos = json_decode($row['photos'], true);
                if ($photos && is_array($photos)) {
                    $row['photos'] = json_encode(array_map(function($photo) {
                        if (!$photo || strpos($photo, 'http') === 0) {
                            return $photo; // Уже полный URL или пустое
                        }
                        return PHOTOS_SERVICES_URL . $photo;
                    }, $photos));
                }
            }
            
            // Process services list
            if ($row['services_list']) {
                $servicesList = json_decode($row['services_list'], true);
                if ($servicesList && is_array($servicesList)) {
                    $row['services'] = $servicesList; // Для совместимости с интерфейсом
                }
            }
            
            $services[] = $row;
        }
        
        sendSuccess($services);
        
    } catch (PDOException $e) {
        error_log("Services query error: " . $e->getMessage());
        sendError('Failed to retrieve services');
    }
}

/**
 * Handle user verification request
 */
function handleVerifyUserRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        sendError('Invalid user data');
    }
    
    $userId = $input['id'];
    
    if (!isValidUserId($userId)) {
        sendError('Invalid user ID');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if user exists and get their status
        $stmt = $pdo->prepare("SELECT * FROM members WHERE telegram_id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // User not found - they might be new
            logApiCall('verify_user', $userId, 'User not found');
            sendSuccess([
                'access' => false,
                'status' => 'не зарегистрирован',
                'message' => 'Пользователь не найден в базе участников клуба'
            ]);
        }
        
        // Check user status - строго только активные для доступа к сайту
        $allowedStatuses = ['активный'];
        $hasAccess = in_array($user['status'], $allowedStatuses);
        
        logApiCall('verify_user', $userId, 'Status: ' . $user['status'] . ', Access: ' . ($hasAccess ? 'granted' : 'denied'));
        
        sendSuccess([
            'access' => $hasAccess,
            'status' => $user['status'],
            'message' => $hasAccess ? 'Доступ разрешен' : 'Доступ запрещен для статуса: ' . $user['status']
        ]);
        
    } catch (PDOException $e) {
        error_log("User verification error: " . $e->getMessage());
        sendError('Failed to verify user');
    }
}

/**
 * Handle add car request
 */
function handleAddCarRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    $requiredFields = ['brand', 'model', 'year', 'reg_number', 'color'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            sendError("Missing required field: $field");
        }
    }
    
    // Validate year
    if (!is_numeric($input['year']) || $input['year'] < 1900 || $input['year'] > date('Y') + 1) {
        sendError('Invalid year');
    }
    
    // Validate registration number format (basic check)
    if (!preg_match('/^[А-Я]{1,2}\d{3}[А-Я]{2}\d{2,3}$/', $input['reg_number'])) {
        sendError('Invalid registration number format');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if registration number already exists
        $stmt = $pdo->prepare("SELECT id FROM cars WHERE reg_number = ?");
        $stmt->execute([$input['reg_number']]);
        if ($stmt->fetch()) {
            sendError('Car with this registration number already exists');
        }
        
        // Get member_id from request data
        if (!isset($input['member_id']) || !is_numeric($input['member_id'])) {
            sendError('Invalid member_id');
        }
        $memberId = (int)$input['member_id'];
        
        // Verify member exists
        $stmt = $pdo->prepare("SELECT id FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        if (!$stmt->fetch()) {
            sendError('Member not found');
        }
        
        // Prepare data for insertion
        $carData = [
            'member_id' => $memberId,
            'brand' => sanitizeInput($input['brand']),
            'model' => sanitizeInput($input['model']),
            'year' => (int)$input['year'],
            'reg_number' => sanitizeInput($input['reg_number']),
            'color' => sanitizeInput($input['color']),
            'engine_volume' => isset($input['engine_volume']) ? sanitizeInput($input['engine_volume']) : null,
            'photos' => isset($input['photos']) ? json_encode($input['photos']) : null
        ];
        
        // Insert car
        $stmt = $pdo->prepare("
            INSERT INTO cars (member_id, brand, model, year, reg_number, color, engine_volume, photos)
            VALUES (:member_id, :brand, :model, :year, :reg_number, :color, :engine_volume, :photos)
        ");
        
        $stmt->execute($carData);
        $carId = $pdo->lastInsertId();
        
        // Log the action
        logApiCall('add_car', $memberId, "Added car: {$carData['brand']} {$carData['model']} {$carData['reg_number']}");
        
        sendSuccess([
            'id' => $carId,
            'message' => 'Car added successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Add car error: " . $e->getMessage());
        sendError('Failed to add car: ' . $e->getMessage());
    }
}

/**
 * Handle add invitation request
 */
function handleAddInvitationRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    $requiredFields = ['car_number'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            sendError("Missing required field: $field");
        }
    }
    
    // Validate registration number format (basic check)
    if (!preg_match('/^[А-Я]{1,2}\d{3}[А-Я]{2}\d{2,3}$/', $input['car_number'])) {
        sendError('Invalid registration number format');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if invitation with this car number already exists
        $stmt = $pdo->prepare("SELECT id FROM invitations WHERE car_number = ? AND status IN ('новое', 'на связи', 'встреча назначена')");
        $stmt->execute([$input['car_number']]);
        if ($stmt->fetch()) {
            sendError('Invitation with this car number already exists');
        }
        
        // Get inviter_member_id from request data
        if (!isset($input['inviter_member_id']) || !is_numeric($input['inviter_member_id'])) {
            sendError('Invalid inviter_member_id');
        }
        $memberId = (int)$input['inviter_member_id'];
        
        // Verify member exists
        $stmt = $pdo->prepare("SELECT id FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        if (!$stmt->fetch()) {
            sendError('Member not found');
        }
        
        // Prepare data for insertion
        $invitationData = [
            'inviter_member_id' => $memberId,
            'car_number' => sanitizeInput($input['car_number']),
            'car_brand' => isset($input['car_brand']) ? sanitizeInput($input['car_brand']) : null,
            'location' => isset($input['location']) ? sanitizeInput($input['location']) : null,
            'meeting_date' => isset($input['meeting_date']) ? $input['meeting_date'] : null,
            'photos' => isset($input['photos']) ? json_encode($input['photos']) : null,
            'status' => 'новое',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Insert invitation
        $stmt = $pdo->prepare("
            INSERT INTO invitations (inviter_member_id, car_number, car_brand, location, meeting_date, photos, status, created_at)
            VALUES (:inviter_member_id, :car_number, :car_brand, :location, :meeting_date, :photos, :status, :created_at)
        ");
        
        $stmt->execute($invitationData);
        $invitationId = $pdo->lastInsertId();
        
        // Log the action
        logApiCall('add_invitation', $memberId, "Added invitation for car: {$invitationData['car_number']}");
        
        sendSuccess([
            'id' => $invitationId,
            'message' => 'Invitation added successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Add invitation error: " . $e->getMessage());
        sendError('Failed to add invitation: ' . $e->getMessage());
    }
}

/**
 * Handle add event request
 */
function handleAddEventRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    $requiredFields = ['title', 'type', 'event_date', 'location'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            sendError("Missing required field: $field");
        }
    }
    
    // Validate event date
    $eventDate = $input['event_date'];
    if (!strtotime($eventDate)) {
        sendError('Invalid event date');
    }
    
    // Validate event type
    $allowedTypes = ['заезд', 'встреча', 'фотосессия', 'поездка', 'банкет'];
    if (!in_array($input['type'], $allowedTypes)) {
        sendError('Invalid event type');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Get organizer_id from request data
        if (!isset($input['organizer_id']) || !is_numeric($input['organizer_id'])) {
            sendError('Invalid organizer_id');
        }
        $memberId = (int)$input['organizer_id'];
        
        // Verify member exists
        $stmt = $pdo->prepare("SELECT id FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        if (!$stmt->fetch()) {
            sendError('Member not found');
        }
        
        // Combine date and time if provided
        $eventDateTime = $eventDate;
        if (isset($input['event_time']) && !empty($input['event_time'])) {
            $eventDateTime = $eventDate . ' ' . $input['event_time'];
        }
        
        // Prepare data for insertion
        $eventData = [
            'organizer_id' => $memberId,
            'title' => sanitizeInput($input['title']),
            'type' => sanitizeInput($input['type']),
            'event_date' => $eventDateTime,
            'location' => sanitizeInput($input['location']),
            'price' => isset($input['price']) && !empty($input['price']) ? (float)$input['price'] : null,
            'photos' => isset($input['photos']) ? json_encode($input['photos']) : null,
            'status' => 'запланировано',
            'participants_count' => 0,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Insert event
        $stmt = $pdo->prepare("
            INSERT INTO events (organizer_id, title, type, event_date, location, price, photos, status, participants_count, created_at)
            VALUES (:organizer_id, :title, :type, :event_date, :location, :price, :photos, :status, :participants_count, :created_at)
        ");
        
        $stmt->execute($eventData);
        $eventId = $pdo->lastInsertId();
        
        // Log the action
        logApiCall('add_event', $memberId, "Added event: {$eventData['title']} on {$eventData['event_date']}");
        
        sendSuccess([
            'id' => $eventId,
            'message' => 'Event added successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Add event error: " . $e->getMessage());
        sendError('Failed to add event: ' . $e->getMessage());
    }
}

/**
 * Handle add service request
 */
function handleAddServiceRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    $requiredFields = ['name', 'type', 'address'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            sendError("Missing required field: $field");
        }
    }
    
    // Validate service type
    $allowedTypes = ['автосервис', 'детейлинг', 'шиномонтаж', 'электрик', 'автомойка', 'тюнинг', 'страхование'];
    if (!in_array($input['type'], $allowedTypes)) {
        sendError('Invalid service type');
    }
    
    // Validate rating if provided
    if (isset($input['rating']) && !empty($input['rating'])) {
        $rating = (int)$input['rating'];
        if ($rating < 1 || $rating > 5) {
            sendError('Rating must be between 1 and 5');
        }
    }
    
    $pdo = getDbConnection();
    
    try {
        // Get added_by_member_id from request data
        if (!isset($input['added_by_member_id']) || !is_numeric($input['added_by_member_id'])) {
            sendError('Invalid added_by_member_id');
        }
        $memberId = (int)$input['added_by_member_id'];
        
        // Verify member exists
        $stmt = $pdo->prepare("SELECT id FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        if (!$stmt->fetch()) {
            sendError('Member not found');
        }
        
        // Prepare data for insertion
        $serviceData = [
            'added_by_member_id' => $memberId,
            'name' => sanitizeInput($input['name']),
            'type' => sanitizeInput($input['type']),
            'address' => sanitizeInput($input['address']),
            'phone' => isset($input['phone']) ? sanitizeInput($input['phone']) : null,
            'rating' => isset($input['rating']) && !empty($input['rating']) ? (int)$input['rating'] : null,
            'recommendation' => isset($input['recommendation']) ? sanitizeInput($input['recommendation']) : null,
            'photos' => isset($input['photos']) ? json_encode($input['photos']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Insert service
        $stmt = $pdo->prepare("
            INSERT INTO services (added_by_member_id, name, type, address, phone, rating, recommendation, photos, created_at)
            VALUES (:added_by_member_id, :name, :type, :address, :phone, :rating, :recommendation, :photos, :created_at)
        ");
        
        $stmt->execute($serviceData);
        $serviceId = $pdo->lastInsertId();
        
        // Log the action
        logApiCall('add_service', $memberId, "Added service: {$serviceData['name']} ({$serviceData['type']})");
        
        sendSuccess([
            'id' => $serviceId,
            'message' => 'Service added successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Add service error: " . $e->getMessage());
        sendError('Failed to add service: ' . $e->getMessage());
    }
}

/**
 * Handle update profile request
 */
function handleUpdateProfileRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    $requiredFields = ['first_name', 'telegram_id'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            sendError("Missing required field: $field");
        }
    }
    
    // Validate birth date if provided
    if (isset($input['birth_date']) && !empty($input['birth_date'])) {
        $birthDate = $input['birth_date'];
        if (!strtotime($birthDate)) {
            sendError('Invalid birth date');
        }
        
        // Check if birth date is not in the future
        if (strtotime($birthDate) > time()) {
            sendError('Birth date cannot be in the future');
        }
        
        // Check if person is at least 18 years old
        $age = date_diff(date_create($birthDate), date_create('today'))->y;
        if ($age < 18) {
            sendError('Person must be at least 18 years old');
        }
    }
    
    $pdo = getDbConnection();
    
    try {
        // Get member_id from telegram_id
        $telegramId = $input['telegram_id'];
        
        // Check if member exists
        $stmt = $pdo->prepare("SELECT id FROM members WHERE telegram_id = ?");
        $stmt->execute([$telegramId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            sendError('Member not found');
        }
        
        $memberId = $member['id'];
        
        // Prepare data for update
        $updateData = [
            'id' => $memberId,
            'first_name' => sanitizeInput($input['first_name']),
            'last_name' => isset($input['last_name']) ? sanitizeInput($input['last_name']) : null,
            'city' => isset($input['city']) ? sanitizeInput($input['city']) : null,
            'phone' => isset($input['phone']) ? sanitizeInput($input['phone']) : null,
            'birth_date' => isset($input['birth_date']) && !empty($input['birth_date']) ? $input['birth_date'] : null,
            'photo_url' => isset($input['photo']) ? $input['photo'] : null,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Build dynamic update query
        $updateFields = [];
        $updateValues = [];
        
        foreach ($updateData as $field => $value) {
            if ($field !== 'id' && $value !== null) {
                $updateFields[] = "$field = :$field";
                $updateValues[$field] = $value;
            }
        }
        
        if (empty($updateFields)) {
            sendError('No fields to update');
        }
        
        $updateValues['id'] = $memberId;
        
        // Update member
        $stmt = $pdo->prepare("
            UPDATE members 
            SET " . implode(', ', $updateFields) . "
            WHERE id = :id
        ");
        
        $stmt->execute($updateValues);
        
        // Log the action
        logApiCall('update_profile', $memberId, "Updated profile for member ID: $memberId");
        
        sendSuccess([
            'message' => 'Profile updated successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Update profile error: " . $e->getMessage());
        sendError('Failed to update profile: ' . $e->getMessage());
    }
}

/**
 * Handle get member ID request
 */
function handleGetMemberIdRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['telegram_id'])) {
        sendError('Invalid user data');
    }
    
    $telegramId = $input['telegram_id'];
    
    if (!isValidUserId($telegramId)) {
        sendError('Invalid user ID');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if user exists and get their member_id and admin status
        $stmt = $pdo->prepare("SELECT id, isAdmin FROM members WHERE telegram_id = ?");
        $stmt->execute([$telegramId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            sendError('Member not found');
        }
        
        sendSuccess([
            'member_id' => $member['id'],
            'isAdmin' => (bool)$member['isAdmin']
        ]);
        
    } catch (PDOException $e) {
        error_log("Get member ID error: " . $e->getMessage());
        sendError('Failed to get member ID');
    }
}

/**
 * Handle update car request
 */
function handleUpdateCarRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid JSON data');
    }
    
    // Validate required fields
    if (!isset($input['id']) || !is_numeric($input['id'])) {
        sendError('Invalid car ID');
    }
    
    $carId = (int)$input['id'];
    
    // Get telegram_id from input data
    if (!isset($input['telegram_id'])) {
        sendError('User not authenticated');
    }
    $telegramId = $input['telegram_id'];
    
    $pdo = getDbConnection();
    
    try {
        // Check if user is owner or admin
        $stmt = $pdo->prepare("SELECT m.id, m.isAdmin FROM members m WHERE m.telegram_id = ?");
        $stmt->execute([$telegramId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            sendError('Member not found');
        }
        
        // Check if user is owner of the car or admin
        $stmt = $pdo->prepare("SELECT member_id FROM cars WHERE id = ?");
        $stmt->execute([$carId]);
        $car = $stmt->fetch();
        
        if (!$car) {
            sendError('Car not found');
        }
        
        if (!$member['isAdmin'] && $car['member_id'] != $member['id']) {
            sendError('Access denied: you can only edit your own cars');
        }
        
        // Check if registration number already exists (excluding current car)
        if (isset($input['reg_number']) && $input['reg_number'] !== $car['reg_number']) {
            $stmt = $pdo->prepare("SELECT id FROM cars WHERE reg_number = ? AND id != ?");
            $stmt->execute([$input['reg_number'], $carId]);
            if ($stmt->fetch()) {
                sendError('Car with this registration number already exists');
            }
        }
        
        // Build update data
        $updateData = [];
        $updateParams = [];
        
        $fields = ['brand', 'model', 'year', 'reg_number', 'color', 'engine_volume'];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updateData[] = "$field = :$field";
                if ($field === 'year') {
                    $updateParams[$field] = (int)$input[$field];
                } else {
                    $updateParams[$field] = sanitizeInput($input[$field]);
                }
            }
        }
        
        if (empty($updateData)) {
            sendError('No fields to update');
        }
        
        $updateParams['id'] = $carId;
        
        // Update car
        $stmt = $pdo->prepare("
            UPDATE cars 
            SET " . implode(', ', $updateData) . "
            WHERE id = :id
        ");
        
        $stmt->execute($updateParams);
        
        // Log the action
        logApiCall('update_car', $car['member_id'], "Updated car ID: $carId");
        
        sendSuccess([
            'message' => 'Car updated successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Update car error: " . $e->getMessage());
        sendError('Failed to update car: ' . $e->getMessage());
    }
}

/**
 * Handle delete car request
 */
function handleDeleteCarRequest() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('POST method required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id']) || !is_numeric($input['id'])) {
        sendError('Invalid car ID');
    }
    
    $carId = (int)$input['id'];
    
    // Get telegram_id from input data
    if (!isset($input['telegram_id'])) {
        sendError('User not authenticated');
    }
    $telegramId = $input['telegram_id'];
    
    $pdo = getDbConnection();
    
    try {
        // Check if user is owner or admin
        $stmt = $pdo->prepare("SELECT m.id, m.isAdmin FROM members m WHERE m.telegram_id = ?");
        $stmt->execute([$telegramId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            sendError('Member not found');
        }
        
        // Check if user is owner of the car or admin
        $stmt = $pdo->prepare("SELECT member_id FROM cars WHERE id = ?");
        $stmt->execute([$carId]);
        $car = $stmt->fetch();
        
        if (!$car) {
            sendError('Car not found');
        }
        
        if (!$member['isAdmin'] && $car['member_id'] != $member['id']) {
            sendError('Access denied: you can only delete your own cars');
        }
        
        // Delete car
        $stmt = $pdo->prepare("DELETE FROM cars WHERE id = ?");
        $stmt->execute([$carId]);
        
        // Log the action
        logApiCall('delete_car', $car['member_id'], "Deleted car: {$car['brand']} {$car['model']} {$car['reg_number']}");
        
        sendSuccess([
            'message' => 'Car deleted successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Delete car error: " . $e->getMessage());
        sendError('Failed to delete car: ' . $e->getMessage());
    }
}

/**
 * Проверка наличия номера среди машин клуба
 */
function handleCheckCarNumberRequest() {
    $pdo = getDbConnection();
    $input = json_decode(file_get_contents('php://input'), true);
    $regNumber = trim($input['reg_number'] ?? '');
    // Валидация: только латиница и цифры, минимум 3 символа
    if (!preg_match('/^[A-Za-z0-9]{3,}$/', $regNumber)) {
        sendSuccess(['found' => false]);
    }
    try {
        // Поиск среди машин с нужными статусами владельца (частичное совпадение)
        $stmt = $pdo->prepare('
            SELECT c.id
            FROM cars c
            JOIN members m ON c.member_id = m.id
            WHERE REPLACE(UPPER(c.reg_number), " ", "") LIKE UPPER(?)
              AND m.status IN ("активный", "участник", "новый")
            LIMIT 1
        ');
        $stmt->execute(['%' . $regNumber . '%']);
        $found = $stmt->fetch() ? true : false;
        sendSuccess(['found' => $found]);
    } catch (PDOException $e) {
        error_log("Check car number error: " . $e->getMessage());
        sendError('DB error');
    }
}
?>