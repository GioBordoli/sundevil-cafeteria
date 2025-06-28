// Authentication functions

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateNavigation();
        showAlert(`Welcome back, ${currentUser.fullName}!`, 'success');
        
        // Redirect to appropriate dashboard
        showDashboard();
        
    } catch (error) {
        showAlert(error.message || 'Login failed', 'danger');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const fullName = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                email: email,
                fullName: fullName,
                password: password,
                role: role
            })
        });
        
        showAlert('Account created successfully! Please login.', 'success');
        
        // Switch to login tab
        const loginTab = document.querySelector('a[href="#login-tab"]');
        const loginTabInstance = new bootstrap.Tab(loginTab);
        loginTabInstance.show();
        
        // Clear form
        event.target.reset();
        
    } catch (error) {
        showAlert(error.message || 'Registration failed', 'danger');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Check authentication for protected actions
function requireAuth() {
    if (!currentUser) {
        showAlert('Please login to continue', 'warning');
        showPage('login');
        return false;
    }
    return true;
}

// Check if user has specific role
function hasRole(role) {
    return currentUser && currentUser.role === role;
}

// Check if user has any of the specified roles
function hasAnyRole(roles) {
    return currentUser && roles.includes(currentUser.role);
} 