// auth.js
import { auth } from '/app.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Redirect to login page if not authenticated
            window.location.href = '/index.html';
        }
    });

    // Logout function
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth)
                .then(() => {
                    alert("Logged out successfully");
                    window.location.href = '/index.html';
                })
                .catch((error) => {
                    console.error("Error during logout:", error);
                    alert("Failed to log out. Please try again.");
                });
        });
    }
});
