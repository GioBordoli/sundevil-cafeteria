// Global variables
const API_BASE_URL = 'https://sundevil-cafeteria-backend-422695426685.us-central1.run.app/api';
let currentUser = null;
let cart = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavigation();
    }
    
    // Load menu items on page load
    loadMenuItems();
    
    // Set up event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Navigation functions
function showPage(pageId) {
    // Check if workers/managers are trying to access menu
    if (pageId === 'menu' && currentUser && (currentUser.role === 'WORKER' || currentUser.role === 'MANAGER')) {
        showAlert('Access denied. Workers and managers cannot access the ordering menu.', 'warning');
        showDashboard();
        return;
    }
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show requested page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('d-none');
        targetPage.classList.add('fade-in');
    }
    
    // Special handling for specific pages
    if (pageId === 'menu') {
        loadMenuItems();
    }
}

function showDashboard() {
    if (!currentUser) {
        showPage('login');
        return;
    }
    
    // Hide all pages and dashboards
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show appropriate dashboard based on user role
    let dashboardId;
    switch (currentUser.role) {
        case 'CUSTOMER':
            dashboardId = 'customer-dashboard';
            loadCustomerOrders();
            break;
        case 'WORKER':
            dashboardId = 'worker-dashboard';
            loadActiveOrders();
            break;
        case 'MANAGER':
            dashboardId = 'manager-dashboard';
            loadMenuManagement();
            loadOrderStats();
            break;
        default:
            dashboardId = 'customer-dashboard';
    }
    
    const dashboard = document.getElementById(dashboardId);
    if (dashboard) {
        dashboard.classList.remove('d-none');
        dashboard.classList.add('fade-in');
    }
}

function updateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    const heroButtons = document.querySelector('.hero-section');
    
    if (currentUser) {
        // Hide login link, show dashboard and logout
        document.getElementById('nav-auth').classList.add('d-none');
        document.getElementById('nav-dashboard').classList.remove('d-none');
        document.getElementById('nav-logout').classList.remove('d-none');
        
        // Role-based navigation control
        if (currentUser.role === 'WORKER' || currentUser.role === 'MANAGER') {
            // Hide menu navigation for workers and managers
            if (navMenu) {
                navMenu.classList.add('d-none');
            }
            // Hide "Browse Menu" button on home page for workers and managers
            if (heroButtons) {
                const browseMenuBtn = heroButtons.querySelector('button[onclick="showPage(\'menu\')"]');
                if (browseMenuBtn) {
                    browseMenuBtn.style.display = 'none';
                }
            }
        } else {
            // Show menu navigation for customers
            if (navMenu) {
                navMenu.classList.remove('d-none');
            }
            // Show "Browse Menu" button on home page for customers
            if (heroButtons) {
                const browseMenuBtn = heroButtons.querySelector('button[onclick="showPage(\'menu\')"]');
                if (browseMenuBtn) {
                    browseMenuBtn.style.display = 'inline-block';
                }
            }
        }
    } else {
        // Show login link, hide dashboard and logout
        document.getElementById('nav-auth').classList.remove('d-none');
        document.getElementById('nav-dashboard').classList.add('d-none');
        document.getElementById('nav-logout').classList.add('d-none');
        
        // Show menu navigation for non-logged in users
        if (navMenu) {
            navMenu.classList.remove('d-none');
        }
        // Show "Browse Menu" button on home page for non-logged in users
        if (heroButtons) {
            const browseMenuBtn = heroButtons.querySelector('button[onclick="showPage(\'menu\')"]');
            if (browseMenuBtn) {
                browseMenuBtn.style.display = 'inline-block';
            }
        }
    }
}

function logout() {
    currentUser = null;
    cart = [];
    localStorage.removeItem('currentUser');
    updateNavigation();
    updateCartDisplay();
    showPage('home');
    showAlert('Logged out successfully', 'success');
}

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the page
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        let data = null;
        
        if (contentType && contentType.includes('application/json')) {
            const responseText = await response.text();
            if (responseText.trim()) {
                data = JSON.parse(responseText);
            }
        }
        
        if (!response.ok) {
            throw new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data || [];
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Loading indicator functions
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner-border spinner-border-custom" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading...</p>
            </div>
        `;
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
} 