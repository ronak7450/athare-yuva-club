document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            localStorage.setItem('auth_token', result.token);
            window.location.href = 'index.html';
        } else {
            alert('लॉगिन विफल: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('लॉगिन में त्रुटि हुई');
    }
});
