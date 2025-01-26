<?php
function getConnection() {
    $host = 'localhost';      // Change this to your database host
    $dbname = 'athare_yuva_club';  // Change this to your database name
    $username = 'root';       // Change this to your database username
    $password = '';          // Change this to your database password
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}
?>
