import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firebaseConfig from './firebaseConfig.js';
import userDashboards from './userConfig.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');
    const loadingElement = document.getElementById('loading-message');
    
    try {
        errorElement.textContent = '';
        loadingElement.textContent = 'Logging in...';
        
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get dashboard URL from configuration
        const userConfig = userDashboards[email];
        
        if (!userConfig) {
            throw new Error('No dashboard assigned');
        }
        
        // Store user info and dashboard URL in Firestore (if not already stored)
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            dashboardUrl: userConfig.dashboardUrl,
            companyName: userConfig.companyName
        }, { merge: true }); // merge: true will only update these fields
        
        // Store in session for current use
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('dashboardUrl', userConfig.dashboardUrl);
        sessionStorage.setItem('companyName', userConfig.companyName);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error:', error);
        if (error.message === 'No dashboard assigned') {
            errorElement.textContent = 'No dashboard is assigned to this email. Please contact administrator.';
        } else {
            errorElement.textContent = 'Invalid email or password';
        }
    } finally {
        loadingElement.textContent = '';
    }
}); 