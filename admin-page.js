// Admin Page - Create, Update, Delete news
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjGsS1ysiIleLKa5z_LGfBQqZLkImcNY4",
    authDomain: "absolute-firebase-52d31.firebaseapp.com",
    projectId: "absolute-firebase-52d31",
    storageBucket: "absolute-firebase-52d31.appspot.com",
    messagingSenderId: "1031045023743",
    appId: "1:1031045023743:web:a16ce917946eb943f309ca",
    measurementId: "G-QSF3CVJG1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;
let userRole = 'Guest';
let newsData = [];
let currentEditingNewsId = null;

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Page - News Management Mode');
    
    // Check admin permissions first
    checkAdminAccess();
    
    // Setup authentication listener
    setupAuth();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load news data
    loadNewsData();
});

// Check if user has admin access
function checkAdminAccess() {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (!user) {
            showMessage('Please login to access admin panel', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        // Check user role
        try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userRole = userData.role || 'Viewer';
                
                if (userRole !== 'Admin') {
                    showMessage('Access denied. Admin privileges required.', 'error');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                    return;
                }
                
                // Update navbar for admin
                updateNavbarForAdmin(user);
                showMessage(`Welcome Admin: ${userData.username || user.email}`);
            } else {
                showMessage('User data not found', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
            showMessage('Error verifying admin access', 'error');
        }
    });
}

// Setup authentication
function setupAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user && userRole === 'Admin') {
            console.log('Admin authenticated:', user.email);
        }
    });
}

// Update navbar for admin
function updateNavbarForAdmin(user) {
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (loginLink && user) {
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-shield-check me-1"></i>${user.displayName || user.email || 'Admin'}
            </a>
            <ul class="dropdown-menu">
                <li><span class="dropdown-item-text small text-muted">Admin Panel</span></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="index.html">View User Page</a></li>
                <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
            </ul>
        `;
        
        loginLink.parentElement.replaceWith(userDropdown);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Create news button
    const saveNewsBtn = document.getElementById('saveNewsBtn');
    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', handleCreateNews);
    }
    
    // Update news button
    const updateNewsBtn = document.getElementById('updateNewsBtn');
    if (updateNewsBtn) {
        updateNewsBtn.addEventListener('click', handleUpdateNews);
    }
}

// Load news data
async function loadNewsData() {
    try {
        const newsQuery = query(
            collection(db, "News"),
            orderBy("date", "desc")
        );
        
        // Listen for real-time updates
        onSnapshot(newsQuery, (snapshot) => {
            newsData = [];
            snapshot.forEach((doc) => {
                newsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            displayNewsInAdmin();
            hideLoading();
        }, (error) => {
            console.error('Error loading news:', error);
            showMessage('Error loading news data', 'error');
            hideLoading();
        });
        
    } catch (error) {
        console.error('Error setting up news listener:', error);
        showMessage('Error connecting to database', 'error');
        hideLoading();
    }
}

// Display news in admin panel
function displayNewsInAdmin() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    if (newsData.length === 0) {
        newsList.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-newspaper display-4 text-muted mb-3"></i>
                <h5 class="text-muted">No news articles yet</h5>
                <p class="text-muted">Create your first news article using the button above</p>
            </div>
        `;
        return;
    }
    
    let newsHtml = '<div class="row">';
    
    newsData.forEach((news) => {
        const publishDate = news.date ? new Date(news.date).toLocaleDateString() : 'Recent';
        const author = news.author || 'Anonymous';
        
        newsHtml += `
            <div class="col-md-6 mb-3">
                <div class="card news-item">
                    <div class="card-body">
                        <h5 class="card-title">${news.title || 'No Title'}</h5>
                        <p class="card-text text-muted">${(news.content || '').substring(0, 100)}${news.content && news.content.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="bi bi-person me-1"></i>${author}
                            </small>
                            <small class="text-muted">
                                <i class="bi bi-calendar me-1"></i>${publishDate}
                            </small>
                        </div>
                        <div class="btn-group w-100">
                            <button class="btn btn-outline-primary btn-sm" onclick="editNews('${news.id}')">
                                <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteNews('${news.id}')">
                                <i class="bi bi-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    newsHtml += '</div>';
    newsList.innerHTML = newsHtml;
}

// Handle create news
async function handleCreateNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const imageFile = document.getElementById('newsImage').files[0];
    const category = document.getElementById('newsCategory').value;
    
    if (!title || !content) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        showButtonLoading('saveNewsBtn', 'Publishing...');
        
        const newsData = {
            title: title,
            content: content,
            category: category,
            author: currentUser.displayName || currentUser.email || 'Admin',
            authorId: currentUser.uid,
            date: new Date().toISOString(),
            createdAt: serverTimestamp()
        };
        
        // Handle image (simplified - just store filename)
        if (imageFile) {
            newsData.image = imageFile.name;
        }
        
        // Add to Firestore
        await addDoc(collection(db, "News"), newsData);
        
        showMessage('News article published successfully!');
        
        // Reset form and close modal
        document.getElementById('newsForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createNewsModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Error creating news:', error);
        showMessage('Error publishing news article', 'error');
    } finally {
        hideButtonLoading('saveNewsBtn', '<i class="bi bi-save me-2"></i>Publish News');
    }
}

// Edit news
window.editNews = function(newsId) {
    const news = newsData.find(n => n.id === newsId);
    if (!news) return;
    
    currentEditingNewsId = newsId;
    
    // Fill edit form
    document.getElementById('editNewsId').value = newsId;
    document.getElementById('editNewsTitle').value = news.title || '';
    document.getElementById('editNewsContent').value = news.content || '';
    document.getElementById('editNewsCategory').value = news.category || 'news';
    
    // Show edit modal
    const modal = new bootstrap.Modal(document.getElementById('editNewsModal'));
    modal.show();
};

// Handle update news
async function handleUpdateNews() {
    const newsId = document.getElementById('editNewsId').value;
    const title = document.getElementById('editNewsTitle').value.trim();
    const content = document.getElementById('editNewsContent').value.trim();
    const category = document.getElementById('editNewsCategory').value;
    
    if (!title || !content) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        showButtonLoading('updateNewsBtn', 'Updating...');
        
        const newsRef = doc(db, 'News', newsId);
        await updateDoc(newsRef, {
            title: title,
            content: content,
            category: category,
            updatedAt: serverTimestamp()
        });
        
        showMessage('News article updated successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editNewsModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Error updating news:', error);
        showMessage('Error updating news article', 'error');
    } finally {
        hideButtonLoading('updateNewsBtn', '<i class="bi bi-save me-2"></i>Update News');
    }
}

// Delete news
window.deleteNews = async function(newsId) {
    const news = newsData.find(n => n.id === newsId);
    if (!news) return;
    
    if (!confirm(`Are you sure you want to delete "${news.title}"?\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'News', newsId));
        showMessage('News article deleted successfully!');
    } catch (error) {
        console.error('Error deleting news:', error);
        showMessage('Error deleting news article', 'error');
    }
};

// Global logout handler
window.handleLogout = async function() {
    try {
        await auth.signOut();
        showMessage('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showMessage('Error logging out', 'error');
    }
};

// Utility functions
function showMessage(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alert.innerHTML = `
        <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function showButtonLoading(buttonId, loadingText) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
    }
}

function hideButtonLoading(buttonId, originalHtml) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}