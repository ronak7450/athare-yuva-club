<?php
session_start();

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Check authentication and redirect if not logged in
function checkAuth() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

// Handle login
function login($pin) {
    $correct_pin = "778299";
    
    if ($pin === $correct_pin) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['last_activity'] = time();
        return true;
    }
    return false;
}

// Handle logout
function logout() {
    session_unset();
    session_destroy();
    header('Location: login.php');
    exit;
}

// Check session timeout (30 minutes)
function checkSessionTimeout() {
    $timeout = 30 * 60; // 30 minutes in seconds
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
        logout();
    }
    $_SESSION['last_activity'] = time();
}

// If logged in, update session timeout
if (isLoggedIn()) {
    checkSessionTimeout();
}
?>
