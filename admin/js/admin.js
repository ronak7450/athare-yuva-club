// Initialize variables
let transactions = {
    income: [],
    expense: []
};

// Camera streams
let incomeStream = null;
let expenseStream = null;

// Load initial data
loadTransactions();

// Photo handling functions
function initializePhotoHandlers(type) {
    const cameraOption = document.getElementById(type + 'CameraOption');
    const fileOption = document.getElementById(type + 'FileOption');
    const fileInput = document.getElementById(type + 'FileInput');
    const cameraContainer = document.querySelector(`#${type}Modal .camera-container`);
    const video = document.getElementById(type + 'Camera');
    const captureBtn = document.getElementById(type + 'CapturePhoto');
    const retakeBtn = document.getElementById(type + 'RetakePhoto');
    const preview = document.getElementById(type + 'Preview');
    const photoInput = document.getElementById(type + 'Photo');

    // Camera option click handler
    cameraOption.addEventListener('click', async () => {
        try {
            fileInput.style.display = 'none';
            cameraContainer.style.display = 'block';
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            if (type === 'income') incomeStream = stream;
            else expenseStream = stream;
            
            video.style.display = 'block';
            captureBtn.style.display = 'block';
        } catch (err) {
            alert('Camera access denied: ' + err.message);
        }
    });

    // File option click handler
    fileOption.addEventListener('click', () => {
        stopCamera(type);
        cameraContainer.style.display = 'none';
        fileInput.style.display = 'block';
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                photoInput.value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Capture photo handler
    captureBtn.addEventListener('click', () => {
        const canvas = document.getElementById(type + 'Canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg');
        photoInput.value = photoData;
        
        preview.src = photoData;
        preview.style.display = 'block';
        
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        
        stopCamera(type);
    });

    // Retake photo handler
    retakeBtn.addEventListener('click', () => {
        preview.style.display = 'none';
        retakeBtn.style.display = 'none';
        fileInput.style.display = 'none';
        photoInput.value = '';
        cameraOption.click(); // Restart camera
    });
}

function stopCamera(type) {
    if (type === 'income' && incomeStream) {
        incomeStream.getTracks().forEach(track => track.stop());
        incomeStream = null;
    } else if (type === 'expense' && expenseStream) {
        expenseStream.getTracks().forEach(track => track.stop());
        expenseStream = null;
    }
}

// Initialize photo handlers
initializePhotoHandlers('income');
initializePhotoHandlers('expense');

// Reset modal handlers
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('hidden.bs.modal', function () {
        const type = this.id.replace('Modal', '');
        stopCamera(type);
        const fileInput = document.getElementById(type + 'FileInput');
        const preview = document.getElementById(type + 'Preview');
        const retakeBtn = document.getElementById(type + 'RetakePhoto');
        const cameraContainer = this.querySelector('.camera-container');
        
        fileInput.value = '';
        fileInput.style.display = 'none';
        preview.style.display = 'none';
        retakeBtn.style.display = 'none';
        cameraContainer.style.display = 'none';
    });
});

// Load transactions from server
async function loadTransactions() {
    try {
        const type = document.getElementById('transactionType').value;
        const response = await fetch('../api/transactions.php?type=' + type, {
            credentials: 'include' // Include session cookies
        });
        
        if (response.status === 401) {
            window.location.href = 'login.php'; // Redirect to login if unauthorized
            return;
        }
        
        const result = await response.json();
        if (result.success) {
            displayTransactions(result.data);
            updateDashboard(result.data);
        } else {
            alert('Error loading transactions: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('Unauthorized')) {
            window.location.href = 'login.php';
        } else {
            alert('Failed to load transactions');
        }
    }
}

// Handle Income Form Submission
document.getElementById('incomeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const incomeData = {
            type: 'income',
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            photo: formData.get('photo') || null,
            date: formattedDate
        };
        
        console.log('Submitting income:', incomeData);
        
        const response = await fetch('../api/transactions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(incomeData)
        });
        
        if (response.status === 401) {
            window.location.href = 'login.php';
            return;
        }
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            await loadTransactions();
            this.reset();
            // Reset camera UI
            const preview = document.getElementById('incomePreview');
            const retakeBtn = document.getElementById('incomeRetakePhoto');
            const fileInput = document.getElementById('incomeFileInput');
            const cameraContainer = document.querySelector(`#incomeModal .camera-container`);
            
            if (preview) preview.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'none';
            if (fileInput) fileInput.value = '';
            if (cameraContainer) cameraContainer.style.display = 'none';
            
            bootstrap.Modal.getInstance(document.getElementById('incomeModal')).hide();
        } else {
            alert('Error adding income: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add income: ' + error.message);
    }
});

// Handle Expense Form Submission
document.getElementById('expenseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const expenseData = {
            type: 'expense',
            title: formData.get('title'),
            amount: parseFloat(formData.get('amount')),
            photo: formData.get('photo') || null,
            date: formattedDate
        };
        
        console.log('Submitting expense:', expenseData);
        
        const response = await fetch('../api/transactions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(expenseData)
        });
        
        if (response.status === 401) {
            window.location.href = 'login.php';
            return;
        }
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            await loadTransactions();
            this.reset();
            // Reset camera UI
            const preview = document.getElementById('expensePreview');
            const retakeBtn = document.getElementById('expenseRetakePhoto');
            const fileInput = document.getElementById('expenseFileInput');
            const cameraContainer = document.querySelector(`#expenseModal .camera-container`);
            
            if (preview) preview.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'none';
            if (fileInput) fileInput.value = '';
            if (cameraContainer) cameraContainer.style.display = 'none';
            
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        } else {
            alert('Error adding expense: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add expense: ' + error.message);
    }
});

// Handle transaction type filter change
document.getElementById('transactionType').addEventListener('change', loadTransactions);

// Display transactions in table
function displayTransactions(data) {
    const tbody = document.getElementById('transactionList');
    tbody.innerHTML = '';
    
    // Combine and sort transactions
    let allTransactions = [];
    
    if (data.income) {
        allTransactions = allTransactions.concat(
            data.income.map(item => ({
                id: item.id,
                description: item.name,
                amount: parseFloat(item.amount),
                photo: item.photo_path,
                date: item.date,
                created_at: item.created_at,
                type: 'income'
            }))
        );
    }
    
    if (data.expense) {
        allTransactions = allTransactions.concat(
            data.expense.map(item => ({
                id: item.id,
                description: item.title,
                amount: parseFloat(item.amount),
                photo: item.photo_path,
                date: item.date,
                created_at: item.created_at,
                type: 'expense'
            }))
        );
    }
    
    // Sort by created_at (newest first)
    allTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);
        return dateB - dateA;
    });
    
    // Create table rows
    allTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.created_at || transaction.date)}</td>
            <td>${transaction.description}</td>
            <td class="text-${transaction.type === 'income' ? 'success' : 'danger'}">
                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </td>
            <td>
                ${transaction.photo ? `<a href="${transaction.photo}" target="_blank" class="btn btn-sm btn-primary">View Photo</a>` : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transaction.id}, '${transaction.type}')">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (allTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No transactions found</td>';
        tbody.appendChild(row);
    }
}

// Update Dashboard
function updateDashboard(data) {
    // Calculate totals
    const totalIncome = data.income ? data.income.reduce((sum, item) => sum + parseFloat(item.amount), 0) : 0;
    const totalExpense = data.expense ? data.expense.reduce((sum, item) => sum + parseFloat(item.amount), 0) : 0;
    const balance = totalIncome - totalExpense;

    // Update display
    document.getElementById('totalIncome').textContent = '₹' + totalIncome.toFixed(2);
    document.getElementById('totalExpense').textContent = '₹' + totalExpense.toFixed(2);
    document.getElementById('balance').textContent = '₹' + balance.toFixed(2);
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Edit transaction
async function editTransaction(id, type) {
    try {
        const response = await fetch(`../api/transactions.php?id=${id}&type=${type}`, {
            credentials: 'include' // Include session cookies
        });
        
        if (response.status === 401) {
            window.location.href = 'login.php';
            return;
        }
        
        const result = await response.json();
        if (result.success) {
            const transaction = result.data;
            const modal = type === 'income' ? 'incomeModal' : 'expenseModal';
            const form = document.getElementById(type + 'Form');
            
            // Fill form with transaction data
            if (type === 'income') {
                form.querySelector('[name="name"]').value = transaction.name;
            } else {
                form.querySelector('[name="title"]').value = transaction.title;
            }
            form.querySelector('[name="amount"]').value = transaction.amount;
            
            // Show modal
            const modalInstance = new bootstrap.Modal(document.getElementById(modal));
            modalInstance.show();
        } else {
            alert('Error loading transaction: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load transaction');
    }
}

// Delete transaction
async function deleteTransaction(id, type) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            const response = await fetch('../api/transactions.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Include session cookies
                body: JSON.stringify({ id, type })
            });
            
            if (response.status === 401) {
                window.location.href = 'login.php';
                return;
            }
            
            const result = await response.json();
            if (result.success) {
                await loadTransactions();
            } else {
                alert('Error deleting transaction: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete transaction');
        }
    }
}
