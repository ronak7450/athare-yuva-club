// Function to format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN');
}

// Function to update dashboard numbers
function updateDashboardNumbers() {
    fetch('/api/transactions.php')
        .then(response => response.json())
        .then(data => {
            let totalIncome = 0;
            let totalExpense = 0;

            data.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncome += parseFloat(transaction.amount);
                } else {
                    totalExpense += parseFloat(transaction.amount);
                }
            });

            const balance = totalIncome - totalExpense;

            document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
            document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
            document.getElementById('balance').textContent = formatCurrency(balance);

            updateTransactionChart(data);
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
        });
}

// Function to update transaction chart
function updateTransactionChart(transactions) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    
    // Process data for chart
    const dates = [...new Set(transactions.map(t => t.date))].sort();
    const incomeData = {};
    const expenseData = {};
    
    dates.forEach(date => {
        incomeData[date] = 0;
        expenseData[date] = 0;
    });

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            incomeData[transaction.date] += parseFloat(transaction.amount);
        } else {
            expenseData[transaction.date] += parseFloat(transaction.amount);
        }
    });

    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Income',
                    data: dates.map(date => incomeData[date]),
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Expense',
                    data: dates.map(date => expenseData[date]),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expense Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

// Update dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardNumbers();
});
