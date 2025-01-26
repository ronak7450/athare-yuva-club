// Initialize variables
let transactions = {
    income: [],
    expense: []
};

// Load initial data
loadTransactions();

// Initialize Chart
const ctx = document.getElementById('transactionChart').getContext('2d');
const transactionChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Income', 'Expense'],
        datasets: [{
            label: 'Amount (₹)',
            data: [0, 0],
            backgroundColor: [
                'rgba(40, 167, 69, 0.7)',
                'rgba(220, 53, 69, 0.7)'
            ],
            borderColor: [
                'rgba(40, 167, 69, 1)',
                'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '₹' + value;
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ₹' + context.raw;
                    }
                }
            }
        }
    }
});

// Load transactions from server
async function loadTransactions() {
    try {
        const response = await fetch('api/transactions.php');
        const result = await response.json();
        if (result.success) {
            updateDashboard(result.data);
        } else {
            console.error('Error loading transactions:', result.error);
        }
    } catch (error) {
        console.error('Error:', error);
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

    // Update chart
    transactionChart.data.datasets[0].data = [totalIncome, totalExpense];
    transactionChart.update();
}

// Auto-refresh data every minute
setInterval(loadTransactions, 60000);

// Set today's date as default in date inputs
document.querySelectorAll('input[type="date"]').forEach(input => {
    input.valueAsDate = new Date();
});
