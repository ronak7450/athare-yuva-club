// Load transactions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    
    // Add event listener for transaction type filter
    document.getElementById('transactionType').addEventListener('change', loadTransactions);
});

// Load transactions
async function loadTransactions() {
    try {
        const type = document.getElementById('transactionType').value;
        const response = await fetch(`api/transactions.php?type=${type}`);
        const result = await response.json();
        
        if (result.success) {
            displayTransactions(result.data);
        } else {
            alert('An error occurred while loading transactions. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load transactions. Please check your internet connection and try again.');
    }
}

function displayTransactions(data) {
    const tbody = document.getElementById('transactionList');
    tbody.innerHTML = '';
    
    // Combine and sort transactions by date
    let allTransactions = [];
    
    if (data.income) {
        allTransactions = allTransactions.concat(
            data.income.map(item => ({
                id: item.id,
                date: item.date,
                name: item.name || '',
                description: item.description || '',
                amount: parseFloat(item.amount),
                note: item.note || '',
                photo_path: item.photo_path || '',
                type: 'income'
            }))
        );
    }
    
    if (data.expense) {
        allTransactions = allTransactions.concat(
            data.expense.map(item => ({
                id: item.id,
                date: item.date,
                name: item.name || item.title || '',
                description: item.description || '',
                amount: parseFloat(item.amount),
                note: item.note || '',
                photo_path: item.photo_path || '',
                type: 'expense'
            }))
        );
    }
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create table rows
    allTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const photoHtml = transaction.photo_path 
            ? `<a href="#" onclick="showPhoto('${transaction.photo_path}', '${transaction.description}')" class="btn btn-sm btn-primary">
                 <i class="fas fa-image"></i> View Photo
               </a>` 
            : 'No Photo';
            
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.name}</td>
            <td>${transaction.description}</td>
            <td class="text-${transaction.type === 'income' ? 'success' : 'danger'}">
                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
            </td>
            <td>${photoHtml}</td>
            <td>${transaction.note}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${transaction.id}', '${transaction.type}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (allTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No transactions found</td>';
        tbody.appendChild(row);
    }
}

async function deleteTransaction(id, type) {
    try {
        // First attempt without PIN
        const response = await fetch('api/transactions.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, type })
        });

        const result = await response.json();
        
        if (!result.success) {
            if (result.requirePin) {
                // Show PIN input dialog
                const pin = prompt('Enter PIN to delete transaction:');
                
                if (pin === null) {
                    return; // User cancelled
                }

                // Try again with PIN
                const pinResponse = await fetch('api/transactions.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, type, pin })
                });

                const pinResult = await pinResponse.json();
                
                if (pinResult.success) {
                    alert('Transaction deleted successfully');
                    loadTransactions(); // Reload the list
                } else {
                    alert('Failed to delete transaction. Please try again.');
                }
            } else {
                // Show error message
                alert('Failed to delete transaction. Please try again.');
            }
        } else {
            alert('Transaction deleted successfully');
            loadTransactions();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the transaction. Please try again.');
    }
}

// Helper function to format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Function to show photo in modal
function showPhoto(photoPath, description) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('photoModal');
    if (!modal) {
        const modalHtml = `
            <div class="modal fade" id="photoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">View Photo</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <img id="modalPhoto" src="" class="img-fluid" style="max-height: 70vh;">
                            <p id="modalDescription" class="mt-2"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('photoModal');
    }

    // Update modal content
    const modalImg = document.getElementById('modalPhoto');
    const modalDescription = document.getElementById('modalDescription');
    modalImg.src = photoPath;
    modalDescription.textContent = description;

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Function to export transactions as PDF
async function exportToPDF() {
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
        
        // Add line
        doc.setLineWidth(0.5);
        doc.line(20, 30, 190, 30);
        
        // Set up columns
        doc.setFontSize(11);
        doc.text("Date & Time", 20, 38);
        doc.text("Description", 80, 38);
        doc.text("Amount", 170, 38, { align: "right" });
        
        // Add line under headers
        doc.line(20, 40, 190, 40);
        
        let y = 48; // Starting y position for transactions
        
        // Sort transactions by date
        const sortedTransactions = [...transactions.income, ...transactions.expense]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add transactions
        sortedTransactions.forEach(transaction => {
            // Format date
            const date = new Date(transaction.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Format amount with ₹ symbol and + or - sign
            const amount = transaction.type === 'income' 
                ? `+₹${transaction.amount.toFixed(2)}`
                : `-₹${transaction.amount.toFixed(2)}`;
            
            // Add transaction details
            doc.setTextColor(0, 0, 0); // Reset to black
            doc.text(`${dateStr} ${timeStr}`, 20, y);
            
            // Description with word wrap
            const description = transaction.description || transaction.name || '';
            const descriptionLines = doc.splitTextToSize(description, 80);
            doc.text(descriptionLines, 80, y);
            
            // Amount in green for income, red for expense
            doc.setTextColor(transaction.type === 'income' ? 0 : 255, 
                           transaction.type === 'income' ? 100 : 0, 0);
            doc.text(amount, 170, y, { align: "right" });
            
            // Calculate next y position based on description length
            y += Math.max(descriptionLines.length * 7, 7);
            
            // Add a light line between transactions
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y-3, 190, y-3);
            
            // Add new page if needed
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });
        
        // Add totals at the bottom
        const totalIncome = transactions.income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpense = transactions.expense.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const balance = totalIncome - totalExpense;
        
        y += 10;
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, y-3, 190, y-3);
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Total Income:", 120, y+5);
        doc.setTextColor(0, 100, 0);
        doc.text(`+₹${totalIncome.toFixed(2)}`, 170, y+5, { align: "right" });
        
        doc.setTextColor(0);
        doc.text("Total Expense:", 120, y+12);
        doc.setTextColor(255, 0, 0);
        doc.text(`-₹${totalExpense.toFixed(2)}`, 170, y+12, { align: "right" });
        
        doc.setTextColor(0);
        doc.text("Balance:", 120, y+19);
        doc.setTextColor(balance >= 0 ? 0 : 255, balance >= 0 ? 100 : 0, 0);
        doc.text(`₹${balance.toFixed(2)}`, 170, y+19, { align: "right" });
        
        // Save the PDF
        doc.save('transaction-report.pdf');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}
