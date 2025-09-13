// User Page - Only for viewing news
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    onSnapshot,
    doc,
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

// Initialize user page
document.addEventListener('DOMContentLoaded', function() {
    console.log('User Page - News Reader Mode');
    
    // Setup authentication listener
    setupAuth();
    
    // Load news from Firebase (optional - keeps existing static news)
    loadNewsFromFirebase();
    
    // Show user info
    showUserInfo();
});

// Setup authentication
function setupAuth() {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            // Get user role
            try {
                const userDoc = await getDoc(doc(db, "Users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userRole = userData.role || 'Viewer';
                } else {
                    userRole = 'Viewer';
                }
            } catch (error) {
                console.log('Could not get user role:', error);
                userRole = 'Viewer';
            }
            
            // Update navbar for logged in user
            updateNavbar(user);
        } else {
            userRole = 'Guest';
        }
        
        // Update user info display
        updateUserInfo();
    });
}

// Update navbar for authenticated users
function updateNavbar(user) {
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (loginLink && user) {
        // Replace login with user menu
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                ${user.displayName || user.email || 'User'}
            </a>
            <ul class="dropdown-menu">
                <li><span class="dropdown-item-text small text-muted">Role: ${userRole}</span></li>
                <li><hr class="dropdown-divider"></li>
                ${userRole === 'Admin' ? '<li><a class="dropdown-item" href="admin.html">Admin Panel</a></li>' : ''}
                <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
            </ul>
        `;
        
        loginLink.parentElement.replaceWith(userDropdown);
    }
}

// Update user info display
function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        if (currentUser) {
            if (userRole === 'Admin') {
                userInfo.className = 'alert alert-warning mb-3';
                userInfo.innerHTML = `
                    <i class="bi bi-shield-check me-2"></i>
                    <strong>Admin Mode:</strong> You have admin privileges. <a href="admin.html" class="alert-link">Go to Admin Panel</a> to manage content.
                `;
            } else {
                userInfo.className = 'alert alert-success mb-3';
                userInfo.innerHTML = `
                    <i class="bi bi-person-check me-2"></i>
                    <strong>Logged In:</strong> Welcome ${currentUser.displayName || 'User'}! You are viewing news as a reader.
                `;
            }
            userInfo.style.display = 'block';
        } else {
            userInfo.style.display = 'block'; // Show default message for guests
        }
    }
}

// Show basic user info
function showUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && userInfo.style.display === 'none') {
        userInfo.style.display = 'block';
    }
}

// Load additional news from Firebase (optional)
async function loadNewsFromFirebase() {
    try {
        const newsQuery = query(
            collection(db, "News"),
            orderBy("date", "desc")
        );
        
        // Listen for real-time updates
        onSnapshot(newsQuery, (snapshot) => {
            if (!snapshot.empty) {
                addFirebaseNewsToPage(snapshot);
            }
        }, (error) => {
            console.log('No Firebase news available, showing static content only');
        });
        
    } catch (error) {
        console.log('Firebase not available, showing static content only');
    }
}

// Add Firebase news to the existing static news
function addFirebaseNewsToPage(snapshot) {
    const newsContainer = document.getElementById('News');
    if (!newsContainer) return;
    
    // Find insertion point (after the title and user info)
    const userInfo = document.getElementById('user-info');
    const insertionPoint = userInfo ? userInfo.nextElementSibling : newsContainer.children[1];
    
    // Remove existing Firebase news
    const existingFirebaseNews = newsContainer.querySelectorAll('.firebase-news');
    existingFirebaseNews.forEach(news => news.remove());
    
    // Add new Firebase news
    snapshot.forEach((doc) => {
        const news = doc.data();
        const newsCard = createNewsCard(news);
        newsCard.classList.add('firebase-news');
        
        if (insertionPoint) {
            newsContainer.insertBefore(newsCard, insertionPoint);
        } else {
            newsContainer.appendChild(newsCard);
        }
    });
}

// Create news card matching existing style
function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const title = news.title || 'No Title';
    const content = news.content || 'No Content';
    const author = news.author || 'Anonymous';
    const imageUrl = news.image ? `./IMG/${news.image}` : '';
    
    card.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${title}" class="slides" width="75%">` :
                    `<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                        <span class="text-muted">No Image</span>
                    </div>`
                }
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <a href="" class="card-title card-heading">${title}</a>
                    <p class="card-text">${content}</p>
                    <figcaption>Source: ${author}</figcaption>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Global logout handler
window.handleLogout = async function() {
    try {
        await auth.signOut();
        showMessage('Logged out successfully');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        showMessage('Error logging out', 'error');
    }
};

// Simple message display
function showMessage(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 4000);
}