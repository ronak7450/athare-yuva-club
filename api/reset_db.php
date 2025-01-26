<?php
require_once __DIR__ . '/../config/db.php';

try {
    $conn = getConnection();
    
    // Drop existing tables
    $conn->exec("DROP TABLE IF EXISTS income");
    $conn->exec("DROP TABLE IF EXISTS expense");
    
    // Create income table
    $conn->exec("CREATE TABLE income (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        photo_path VARCHAR(255),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Create expense table
    $conn->exec("CREATE TABLE expense (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        photo_path VARCHAR(255),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    echo "Database tables reset successfully!";
    
} catch(PDOException $e) {
    die("Error resetting database: " . $e->getMessage());
}
?>
