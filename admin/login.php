<?php
require_once 'auth.php';

// Check if session is not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// If already logged in, redirect to admin panel
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['pin'])) {
    $correct_pin = '778299'; // Admin PIN
    $entered_pin = $_POST['pin'];
    
    if ($entered_pin === $correct_pin) {
        $_SESSION['admin_logged_in'] = true;
        echo "<script>
            alert('Welcome to अठारे युवा क्लब');
            window.location.href = 'index.php';
        </script>";
        exit;
    } else {
        $error = "Incorrect PIN. Please try again.";
    }
}

if (isset($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - अठारे युवा क्लब</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .pin-input {
            letter-spacing: 0.5em;
            text-align: center;
            font-size: 24px;
        }
        body {
            background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        .club-name {
            color: white;
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="club-name">अठारे युवा क्लब</h1>
        <div class="login-container">
            <h3 class="text-center mb-4">Admin Login</h3>
            <?php if (isset($error)): ?>
                <div class="alert alert-danger text-center"><?php echo $error; ?></div>
            <?php endif; ?>
            <form method="POST">
                <div class="mb-4">
                    <input type="password" 
                           name="pin" 
                           class="form-control pin-input" 
                           maxlength="6" 
                           pattern="[0-9]*" 
                           inputmode="numeric"
                           autocomplete="off"
                           placeholder="Enter PIN"
                           required>
                </div>
                <div class="d-grid">
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
            </form>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
