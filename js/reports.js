// Initialize charts
let compareChart = null;
let dailyChart = null;

// Initialize date inputs with current month
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = lastDay;
    
    // Initialize charts
    initializeCharts();
    
    // Load initial report
    loadReport();
});

// Handle form submission
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    loadReport();
});

// Handle PDF download
document.getElementById('downloadPDF').addEventListener('click', generatePDF);

async function loadReport() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('End date must be after start date');
            return;
        }
        
        const response = await fetch(`/api/reports.php?start_date=${startDate}&end_date=${endDate}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            updateDashboard(result.data.summary);
            updateCharts(result.data);
            updateTransactionTable(result.data.transactions);
        } else {
            throw new Error(result.error || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load report: ' + error.message);
    }
}

function updateDashboard(summary) {
    document.getElementById('reportTotalIncome').textContent = '₹' + summary.totalIncome.toFixed(2);
    document.getElementById('reportTotalExpense').textContent = '₹' + summary.totalExpense.toFixed(2);
    document.getElementById('reportBalance').textContent = '₹' + summary.balance.toFixed(2);
}

function initializeCharts() {
    // Compare Chart
    const compareCtx = document.getElementById('compareChart').getContext('2d');
    compareChart = new Chart(compareCtx, {
        type: 'bar',
        data: {
            labels: ['Income vs Expense'],
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1,
                    data: [0]
                },
                {
                    label: 'Expense',
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1,
                    data: [0]
                }
            ]
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
    
    // Daily Chart
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Daily Income',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    data: []
                },
                {
                    label: 'Daily Expense',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    data: []
                }
            ]
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
}

function updateCharts(data) {
    // Update compare chart
    compareChart.data.datasets[0].data = [data.summary.totalIncome];
    compareChart.data.datasets[1].data = [data.summary.totalExpense];
    compareChart.update();
    
    // Update daily chart
    const dates = Object.keys(data.daily).sort();
    dailyChart.data.labels = dates;
    dailyChart.data.datasets[0].data = dates.map(date => data.daily[date].income || 0);
    dailyChart.data.datasets[1].data = dates.map(date => data.daily[date].expense || 0);
    dailyChart.update();
}

function updateTransactionTable(transactions) {
    const tbody = document.querySelector('#reportTransactionList');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || transaction.name || ''}</td>
            <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </td>
            <td>${transaction.type === 'income' ? 'Income' : 'Expense'}</td>
            <td>${transaction.note || ''}</td>
            ${transaction.photo ? `<td><a href="#" onclick="showPhoto('${transaction.photo}', '${transaction.description}')" class="btn btn-sm btn-primary">View Photo</a></td>` : '<td></td>'}
        `;
        tbody.appendChild(row);
    });
    
    if (transactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No transactions found</td>';
        tbody.appendChild(row);
    }
}

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

async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font styles
        doc.setFont("helvetica");
        
        // Add header
        doc.setFontSize(16);
        doc.text("Transaction Report", 105, 15, { align: "center" });
        
        // Add creator info
        doc.setFontSize(10);
        doc.text("Created by Ronak", 105, 22, { align: "center" });
        doc.text(new Date().toLocaleDateString(), 105, 26, { align: "center" });
        
        // Add date range
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        doc.text(`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, 105, 30, { align: "center" });
        
        // Add line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Add summary
        doc.setFontSize(12);
        const totalIncome = document.getElementById('reportTotalIncome').textContent;
        const totalExpense = document.getElementById('reportTotalExpense').textContent;
        const balance = document.getElementById('reportBalance').textContent;
        
        doc.setTextColor(0, 100, 0);
        doc.text(`Total Income: ${totalIncome}`, 20, 45);
        doc.setTextColor(255, 0, 0);
        doc.text(`Total Expense: ${totalExpense}`, 20, 52);
        doc.setTextColor(0, 0, 0);
        doc.text(`Balance: ${balance}`, 20, 59);
        
        // Add line
        doc.line(20, 65, 190, 65);
        
        // Add transactions table header
        doc.setFontSize(11);
        doc.text("Date", 20, 72);
        doc.text("Description", 70, 72);
        doc.text("Amount", 170, 72, { align: "right" });
        
        // Add line under header
        doc.line(20, 75, 190, 75);
        
        let y = 82;
        const transactions = Array.from(document.querySelectorAll('#reportTransactionList tr')).map(row => ({
            date: row.cells[0].textContent,
            description: row.cells[1].textContent,
            amount: row.cells[2].textContent,
            type: row.cells[3].textContent
        }));
        
        transactions.forEach(transaction => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                
                // Add header to new page
                doc.text("Date", 20, y);
                doc.text("Description", 70, y);
                doc.text("Amount", 170, y, { align: "right" });
                doc.line(20, y + 3, 190, y + 3);
                y += 10;
            }
            
            doc.setTextColor(0, 0, 0);
            doc.text(transaction.date, 20, y);
            
            // Handle long descriptions
            const descriptionLines = doc.splitTextToSize(transaction.description, 90);
            doc.text(descriptionLines, 70, y);
            
            // Color code amounts
            doc.setTextColor(transaction.type === 'Income' ? 0 : 255, 
                           transaction.type === 'Income' ? 100 : 0, 0);
            doc.text(transaction.amount, 170, y, { align: "right" });
            
            y += Math.max(descriptionLines.length * 7, 7);
        });
        
        // Save the PDF
        doc.save('transaction-report.pdf');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Function to show photo in a modal
function showPhoto(photoPath, description) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Transaction Photo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="${photoPath}" class="img-fluid" alt="${description || 'Transaction photo'}">
                    ${description ? `<p class="mt-2">${description}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}
