// login.js
import { auth } from '/app.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    onAuthStateChanged(auth, (user) => {
        if (user) window.location.href = '/dashboard.html';
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert(`Logged in successfully as ${userCredential.user.email}`);
                window.location.href = '/dashboard.html';
            })
            .catch((error) => {
                console.error('Login error:', error.code, error.message);
                alert('Login failed. Please check your credentials.');
            });
    });
});
