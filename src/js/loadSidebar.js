// Sidebar class without SPA functionality
import { logoutUser } from '/src/scripts/auth/logout.js';

class Sidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="sidebar">
                <h2>
                    <img src="./assets/img/logo.png" width="40" alt="logo" class="logo">INTELLIPARK<br>SYSTEM
                </h2>        
                <ul>
                    <li class="side-list"><a href="dashboard.html" class="side-link"><img class="sbar-logo" src="assets/img/ds-logo.svg" width="30" alt="">Dashboard</a></li>
                    <li class="side-list"><a href="drivers-info.html" class="side-link"><img class="sbar-logo" src="assets/img/user.svg" width="30" alt="">Drivers Info</a></li>
                    <li class="side-list"><a href="vehicles-in.html" class="side-link"><img class="sbar-logo" src="assets/img/toll.svg" width="30" alt="">Vehicles In</a></li>
                    <li class="side-list"><a href="register.html" class="side-link"><img class="sbar-logo" src="assets/img/user-add.svg" width="30" alt="">Register</a></li>
                    <li class="side-list"><a href="history.html" class="side-link"><img class="sbar-logo" src="assets/img/clock.svg" width="30" alt="">History</a></li>
                </ul>
                <p class="logout-text" id="logoutButton">Logout</p>
            </nav>
        `;
        
        const logoutButton = this.querySelector('#logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', logoutUser);
        }
    }
}

customElements.define('app-sidebar', Sidebar);
