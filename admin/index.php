<?php
require_once 'auth.php';

// Verify authentication
checkAuth();

// Handle logout
if (isset($_POST['logout'])) {
    logout();
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - अठारे युवा क्लब</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .photo-options {
            display: flex;
            gap: 10px;
        }
        .camera-container {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .input-group-text {
            background-color: #e9ecef;
            border: 1px solid #ced4da;
        }
        .welcome-banner {
            background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .welcome-banner h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
        }
        /* Force desktop layout on mobile */
        @media (max-width: 768px) {
            .col-md-4, .col-md-6 {
                width: 100% !important;
                max-width: none !important;
                flex: 0 0 100% !important;
            }
            .container {
                max-width: none !important;
                width: 100% !important;
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .row {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .btn-lg {
                width: 100% !important;
                margin-bottom: 10px !important;
            }
            .card {
                margin-bottom: 15px !important;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#">Admin Dashboard</a>
        </div>
    </nav>

    <div class="container mt-4">
        <!-- Action Buttons -->
        <div class="row mb-4">
            <div class="col-md-6">
                <button class="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2" data-bs-toggle="modal" data-bs-target="#incomeModal">
                    <i class="bi bi-wallet-fill fs-4"></i>
                    <div>
                        <div class="fw-bold">Add Income</div>
                        <small class="d-block">Record money received</small>
                    </div>
                </button>
            </div>
            <div class="col-md-6">
                <button class="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2" data-bs-toggle="modal" data-bs-target="#expenseModal">
                    <i class="bi bi-cash-stack fs-4"></i>
                    <div>
                        <div class="fw-bold">Add Expense</div>
                        <small class="d-block">Record money spent</small>
                    </div>
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card text-white bg-success">
                    <div class="card-body">
                        <h5 class="card-title">Total Income</h5>
                        <h2 class="card-text" id="totalIncome">₹0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-white bg-danger">
                    <div class="card-body">
                        <h5 class="card-title">Total Expense</h5>
                        <h2 class="card-text" id="totalExpense">₹0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-white bg-info">
                    <div class="card-body">
                        <h5 class="card-title">Balance</h5>
                        <h2 class="card-text" id="balance">₹0</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transactions Table -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Transaction History</h5>
                <select class="form-select w-auto" id="transactionType">
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                </select>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped" id="transactionTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="transactionList">
                            <!-- Transactions will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Income Modal -->
    <div class="modal fade" id="incomeModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Income (Money Received)</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="incomeForm">
                        <div class="mb-3">
                            <label class="form-label">Person Name (Who Gave Money)</label>
                            <input type="text" class="form-control" name="name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Amount (₹)</label>
                            <div class="input-group">
                                <span class="input-group-text">₹</span>
                                <input type="number" class="form-control" name="amount" required step="0.01">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Photo (Optional)</label>
                            <div class="photo-options mb-2">
                                <button type="button" class="btn btn-primary me-2" id="incomeCameraOption">
                                    <i class="bi bi-camera"></i> Camera
                                </button>
                                <button type="button" class="btn btn-secondary" id="incomeFileOption">
                                    <i class="bi bi-file-image"></i> Choose Photo
                                </button>
                            </div>
                            <input type="file" id="incomeFileInput" accept="image/*" style="display: none;" class="form-control">
                            <div class="camera-container" style="display: none;">
                                <video id="incomeCamera" class="w-100 mb-2" autoplay playsinline style="display: none;"></video>
                                <canvas id="incomeCanvas" class="w-100 mb-2" style="display: none;"></canvas>
                                <img id="incomePreview" class="w-100 mb-2" style="display: none;">
                                <input type="hidden" name="photo" id="incomePhoto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-info" id="incomeCapturePhoto" style="display: none;">Capture Photo</button>
                                    <button type="button" class="btn btn-warning" id="incomeRetakePhoto" style="display: none;">Retake Photo</button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success">Add Income</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Expense Modal -->
    <div class="modal fade" id="expenseModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Expense</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="expenseForm">
                        <div class="mb-3">
                            <label class="form-label">Expense Title</label>
                            <input type="text" class="form-control" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Amount (₹)</label>
                            <div class="input-group">
                                <span class="input-group-text">₹</span>
                                <input type="number" class="form-control" name="amount" required step="0.01">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Photo (Optional)</label>
                            <div class="photo-options mb-2">
                                <button type="button" class="btn btn-primary me-2" id="expenseCameraOption">
                                    <i class="bi bi-camera"></i> Camera
                                </button>
                                <button type="button" class="btn btn-secondary" id="expenseFileOption">
                                    <i class="bi bi-file-image"></i> Choose Photo
                                </button>
                            </div>
                            <input type="file" id="expenseFileInput" accept="image/*" style="display: none;" class="form-control">
                            <div class="camera-container" style="display: none;">
                                <video id="expenseCamera" class="w-100 mb-2" autoplay playsinline style="display: none;"></video>
                                <canvas id="expenseCanvas" class="w-100 mb-2" style="display: none;"></canvas>
                                <img id="expensePreview" class="w-100 mb-2" style="display: none;">
                                <input type="hidden" name="photo" id="expensePhoto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-info" id="expenseCapturePhoto" style="display: none;">Capture Photo</button>
                                    <button type="button" class="btn btn-warning" id="expenseRetakePhoto" style="display: none;">Retake Photo</button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-danger">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Request camera permissions when page loads
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    console.log('Camera permission granted');
                })
                .catch(function(err) {
                    console.log('Camera permission denied:', err);
                });
        }
    </script>
    <script src="js/admin.js"></script>
    <script>
        // Update transaction list display to show person type
        function updateTransactionList() {
            fetch('/api/transactions.php')
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const tbody = document.querySelector('#transactionTable tbody');
                        tbody.innerHTML = '';
                        
                        const transactions = [];
                        if (result.data.income) {
                            result.data.income.forEach(item => {
                                transactions.push({
                                    date: new Date(item.date || item.created_at),
                                    type: 'Income',
                                    description: `${item.name} (Money Received)`,
                                    amount: parseFloat(item.amount),
                                    id: item.id,
                                    transactionType: 'income'
                                });
                            });
                        }
                        
                        if (result.data.expense) {
                            result.data.expense.forEach(item => {
                                transactions.push({
                                    date: new Date(item.date || item.created_at),
                                    type: 'Expense',
                                    description: item.title,
                                    amount: parseFloat(item.amount),
                                    id: item.id,
                                    transactionType: 'expense'
                                });
                            });
                        }
                        
                        // Sort by date descending
                        transactions.sort((a, b) => b.date - a.date);
                        
                        transactions.forEach(transaction => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${transaction.date.toLocaleDateString()}</td>
                                <td>${transaction.type}</td>
                                <td>${transaction.description}</td>
                                <td class="text-${transaction.type === 'Income' ? 'success' : 'danger'}">
                                    ₹${transaction.amount.toFixed(2)}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="deleteTransaction('${transaction.transactionType}', ${transaction.id})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            `;
                            tbody.appendChild(tr);
                        });
                        
                        updateDashboardSummary(result.data);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        // Initial load
        updateTransactionList();
        
        // Refresh every 30 seconds
        setInterval(updateTransactionList, 30000);
    </script>
</body>
</html>
