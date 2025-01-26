<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

if (!$startDate || !$endDate) {
    http_response_code(400);
    echo json_encode(['error' => 'Start date and end date are required']);
    exit;
}

try {
    $conn = getConnection();
    
    // Get income transactions
    $incomeStmt = $conn->prepare("
        SELECT id, date, name as description, name, amount, note, photo_path, 'income' as type 
        FROM income 
        WHERE date BETWEEN ? AND ?
        ORDER BY date
    ");
    $incomeStmt->execute([$startDate, $endDate]);
    $incomeTransactions = $incomeStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get expense transactions
    $expenseStmt = $conn->prepare("
        SELECT id, date, title as description, title as name, amount, note, photo_path, 'expense' as type 
        FROM expense 
        WHERE date BETWEEN ? AND ?
        ORDER BY date
    ");
    $expenseStmt->execute([$startDate, $endDate]);
    $expenseTransactions = $expenseStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate daily totals
    $dailyTotals = [];
    $allDates = [];
    
    // Process income
    foreach ($incomeTransactions as $transaction) {
        $date = $transaction['date'];
        if (!isset($dailyTotals[$date])) {
            $dailyTotals[$date] = ['income' => 0, 'expense' => 0];
        }
        $dailyTotals[$date]['income'] += floatval($transaction['amount']);
        $allDates[$date] = true;
    }
    
    // Process expenses
    foreach ($expenseTransactions as $transaction) {
        $date = $transaction['date'];
        if (!isset($dailyTotals[$date])) {
            $dailyTotals[$date] = ['income' => 0, 'expense' => 0];
        }
        $dailyTotals[$date]['expense'] += floatval($transaction['amount']);
        $allDates[$date] = true;
    }
    
    // Sort dates
    ksort($dailyTotals);
    
    // Calculate totals
    $totalIncome = array_sum(array_column($incomeTransactions, 'amount'));
    $totalExpense = array_sum(array_column($expenseTransactions, 'amount'));
    
    echo json_encode([
        'success' => true,
        'data' => [
            'transactions' => array_merge($incomeTransactions, $expenseTransactions),
            'dailyTotals' => $dailyTotals,
            'summary' => [
                'totalIncome' => floatval($totalIncome),
                'totalExpense' => floatval($totalExpense),
                'balance' => floatval($totalIncome - $totalExpense)
            ]
        ]
    ]);
    
} catch(Exception $e) {
    error_log("Reports error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An error occurred while generating the report']);
}
