// Simple Authentication System - giữ nguyên UI hiện tại
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp 
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
const googleProvider = new GoogleAuthProvider();

// Global state
let currentUser = null;
let userRole = 'Guest';

// Initialize authentication
export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            // Get user role from Firestore
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userRole = userData.role || 'Viewer';
            } else {
                userRole = 'Viewer';
            }
        } else {
            userRole = 'Guest';
        }
        
        // Update UI based on auth state
        updateNavbar();
        updateCreateButton();
    });
}

// Update navbar for authenticated users
function updateNavbar() {
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (currentUser && loginLink) {
        // Replace login link with user dropdown
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                ${currentUser.displayName || currentUser.email || 'User'}
            </a>
            <ul class="dropdown-menu">
                <li><span class="dropdown-item-text small text-muted">Role: ${userRole}</span></li>
                <li><hr class="dropdown-divider"></li>
                ${userRole === 'Admin' ? '<li><a class="dropdown-item" href="admin-simple.html">Admin Panel</a></li>' : ''}
                <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
            </ul>
        `;
        
        loginLink.parentElement.replaceWith(userDropdown);
    }
}

// Update create button visibility
function updateCreateButton() {
    const createBtn = document.getElementById('creator');
    if (createBtn) {
        if (userRole === 'Admin' || userRole === 'Writer') {
            createBtn.style.display = 'inline-block';
            createBtn.textContent = userRole === 'Admin' ? '+ Manage News' : '+ Add News';
            createBtn.href = userRole === 'Admin' ? 'admin-simple.html' : 'create.html';
        } else {
            createBtn.style.display = 'none';
        }
    }
}

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        showMessage('Login successful!', 'success');
        return { success: true, user };
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
        }
        
        showMessage(errorMessage, 'danger');
        return { success: false, error };
    }
}

// Register function
export async function register(username, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await setDoc(doc(db, "Users", user.uid), {
            username: username,
            email: email,
            role: 'Viewer', // Default role
            createdAt: serverTimestamp()
        });
        
        showMessage('Registration successful! You can now login.', 'success');
        return { success: true, user };
    } catch (error) {
        let errorMessage = 'Registration failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
        }
        
        showMessage(errorMessage, 'danger');
        return { success: false, error };
    }
}

// Google login
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user exists in Firestore, if not create
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, "Users", user.uid), {
                username: user.displayName,
                email: user.email,
                role: 'Viewer',
                createdAt: serverTimestamp()
            });
        }
        
        showMessage('Google login successful!', 'success');
        return { success: true, user };
    } catch (error) {
        showMessage('Google login failed.', 'danger');
        return { success: false, error };
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
        showMessage('Logged out successfully.', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showMessage('Logout failed.', 'danger');
    }
}

// Check if user is admin
export async function isAdmin() {
    if (!currentUser) return false;
    
    const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
    if (userDoc.exists()) {
        return userDoc.data().role === 'Admin';
    }
    return false;
}

// Show message function
function showMessage(message, type = 'info') {
    // Create a simple alert that matches current UI style
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 4000);
}

// Global logout handler
window.handleLogout = logout;

// Export auth objects for other files
export { auth, db, currentUser, userRole };
