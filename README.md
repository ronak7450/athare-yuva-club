# अठारे युवा क्लब - Financial Management System

A comprehensive financial management system for अठारे युवा क्लब that helps track income, expenses, and generate reports.

## Features

- 💰 Transaction Management (Income & Expenses)
- 📊 Financial Reports & Analytics
- 📸 Photo Upload Support
- 🔒 Secure Admin Panel
- 📱 Mobile-Responsive Design

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript, Bootstrap 5
- Backend: PHP
- Database: MySQL
- Charts: Chart.js
- Icons: Bootstrap Icons

## Directory Structure

```
.
├── admin/           # Admin panel files
├── api/            # API endpoints
├── config/         # Configuration files
├── css/           # Custom CSS files
├── js/            # JavaScript files
├── uploads/       # Uploaded files directory
└── index.html     # Main entry point
```

## Setup Instructions

1. Clone the repository
2. Copy `config/db.example.php` to `config/db.php` and update database credentials
3. Create the MySQL database and import the schema from `database.sql`
4. Ensure the `uploads` directory has write permissions
5. Configure your web server to serve the application

## Configuration

Create `config/db.php` with the following structure:

```php
<?php
function getConnection() {
    $host = 'your_host';
    $dbname = 'your_database';
    $username = 'your_username';
    $password = 'your_password';
    
    return new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
}
?>
```

## Security Features

- Session-based authentication
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure file upload handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
