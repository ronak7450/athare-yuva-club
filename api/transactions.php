<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/db.php';
session_start();

// Function to check if request is from admin panel
function isAdminRequest() {
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    return strpos($referer, '/admin/') !== false;
}

// Check authentication for admin panel requests only
if (isAdminRequest() && !isset($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getConnection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
switch($method) {
    case 'GET':
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        getTransactions($type);
        break;
    case 'POST':
        $rawData = file_get_contents('php://input');
        error_log("Raw POST data received: " . $rawData);
        
        $data = json_decode($rawData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
            exit;
        }
        
        addTransaction($data);
        break;
    case 'DELETE':
        $rawData = file_get_contents('php://input');
        error_log("Raw DELETE data received: " . $rawData);
        
        $data = json_decode($rawData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
            exit;
        }
        
        deleteTransaction($data);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getTransactions($type) {
    global $conn;
    
    try {
        $result = [];
        
        if ($type == 'all' || $type == 'income') {
            $stmt = $conn->query("SELECT * FROM income ORDER BY date DESC, created_at DESC");
            if ($stmt) {
                $result['income'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $result['income'] = [];
            }
        }
        
        if ($type == 'all' || $type == 'expense') {
            $stmt = $conn->query("SELECT * FROM expense ORDER BY date DESC, created_at DESC");
            if ($stmt) {
                $result['expense'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $result['expense'] = [];
            }
        }
        
        echo json_encode(['success' => true, 'data' => $result]);
    } catch(PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function addTransaction($data) {
    global $conn;
    
    try {
        // Log incoming data
        error_log("Incoming transaction data: " . json_encode($data));
        
        // Validate required fields
        if (empty($data['type'])) {
            throw new Exception('Transaction type is required');
        }

        if ($data['type'] === 'income') {
            if (empty($data['name']) || !isset($data['amount'])) {
                throw new Exception('Name and amount are required for income');
            }
            if (!is_numeric($data['amount'])) {
                throw new Exception('Amount must be a number');
            }
        } else if ($data['type'] === 'expense') {
            if (empty($data['title']) || !isset($data['amount'])) {
                throw new Exception('Title and amount are required for expense');
            }
            if (!is_numeric($data['amount'])) {
                throw new Exception('Amount must be a number');
            }
        } else {
            throw new Exception('Invalid transaction type');
        }

        // Handle photo upload if present
        $photoPath = null;
        if (isset($data['photo']) && !empty($data['photo'])) {
            $photoPath = handlePhotoUpload($data['photo']);
        }

        // Insert transaction
        if ($data['type'] === 'income') {
            $stmt = $conn->prepare("INSERT INTO income (name, amount, photo_path, date) VALUES (?, ?, ?, ?)");
            error_log("Executing income insert with values: " . json_encode([$data['name'], $data['amount'], $photoPath, $data['date']]));
            $result = $stmt->execute([$data['name'], $data['amount'], $photoPath, $data['date']]);
            if (!$result) {
                $error = $stmt->errorInfo();
                throw new Exception('Failed to insert income record: ' . json_encode($error));
            }
        } else if ($data['type'] === 'expense') {
            $stmt = $conn->prepare("INSERT INTO expense (title, amount, photo_path, date) VALUES (?, ?, ?, ?)");
            error_log("Executing expense insert with values: " . json_encode([$data['title'], $data['amount'], $photoPath, $data['date']]));
            $result = $stmt->execute([$data['title'], $data['amount'], $photoPath, $data['date']]);
            if (!$result) {
                $error = $stmt->errorInfo();
                throw new Exception('Failed to insert expense record: ' . json_encode($error));
            }
        }
        
        error_log("Transaction added successfully");
        echo json_encode(['success' => true]);
        
    } catch(Exception $e) {
        error_log("Error in addTransaction: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePhotoUpload($photoData) {
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("Failed to create uploads directory: " . $uploadDir);
            throw new Exception('Failed to create uploads directory');
        }
    }
    
    // Decode base64 image
    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $photoData));
    if ($imageData === false) {
        error_log("Failed to decode base64 image data");
        throw new Exception('Invalid image data');
    }
    
    // Generate unique filename
    $filename = uniqid() . '.jpg';
    $filepath = $uploadDir . $filename;
    
    // Save image file
    if (file_put_contents($filepath, $imageData)) {
        $photoPath = '../uploads/' . $filename;
        error_log("Photo saved successfully at: " . $photoPath);
        return $photoPath;
    } else {
        error_log("Failed to save photo at: " . $filepath);
        throw new Exception('Failed to save photo');
    }
}

function deleteTransaction($data) {
    global $conn;
    
    try {
        // Log incoming data
        error_log("Delete transaction data: " . json_encode($data));
        
        // Validate required fields first
        if (!isset($data['id']) || !isset($data['type'])) {
            throw new Exception('ID and type are required');
        }

        // Validate transaction type
        if (!in_array($data['type'], ['income', 'expense'])) {
            throw new Exception('Invalid transaction type. Must be either income or expense');
        }
        
        // Check if PIN is provided
        if (!isset($data['pin'])) {
            // Return a specific response indicating PIN is required
            echo json_encode([
                'success' => false, 
                'requirePin' => true,
                'message' => 'Please enter PIN to confirm deletion'
            ]);
            return;
        }
        
        // Verify PIN
        if ($data['pin'] !== '0547') {
            error_log("Invalid PIN attempt: " . $data['pin']);
            echo json_encode([
                'success' => false,
                'error' => 'Incorrect PIN. Transaction not deleted.',
                'requirePin' => true
            ]);
            return;
        }
        
        // Get the table name based on type (already validated above)
        $table = $data['type'];
        
        // First check if the transaction exists and get its photo path
        $stmt = $conn->prepare("SELECT photo_path FROM {$table} WHERE id = ?");
        if (!$stmt->execute([$data['id']])) {
            $error = $stmt->errorInfo();
            throw new Exception('Failed to check transaction: ' . json_encode($error));
        }
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception('Transaction not found');
        }
        
        // Delete the transaction
        $stmt = $conn->prepare("DELETE FROM {$table} WHERE id = ?");
        if (!$stmt->execute([$data['id']])) {
            $error = $stmt->errorInfo();
            throw new Exception('Failed to delete transaction: ' . json_encode($error));
        }
        
        // If there was a photo, delete it
        if ($row['photo_path']) {
            $photoPath = __DIR__ . '/../' . ltrim($row['photo_path'], '../');
            if (file_exists($photoPath)) {
                if (!unlink($photoPath)) {
                    error_log("Warning: Could not delete photo file: " . $photoPath);
                }
            }
        }
        
        error_log("Transaction deleted successfully");
        echo json_encode(['success' => true, 'message' => 'Transaction deleted successfully']);
    } catch(PDOException $e) {
        error_log("Database error in deleteTransaction: " . $e->getMessage());
        error_log("SQL State: " . $e->errorInfo[0]);
        error_log("Error Code: " . $e->errorInfo[1]);
        error_log("Error Message: " . $e->errorInfo[2]);
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error occurred while deleting transaction']);
    } catch(Exception $e) {
        error_log("Error in deleteTransaction: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
