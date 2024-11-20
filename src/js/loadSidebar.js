// Sidebar class without SPA functionality
import { logoutUser } from '/src/scripts/auth/logout.js';

class Sidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="sidebar">
                <h2 class="sbar-align">
                    <img src="https://raw.githubusercontent.com/edco-dev/Intellipark-Images/2e161a45b745a345a020913181cacf47501e3b88/carLogo.svg" width="40" alt="logo" class="logo">INTELLIPARK<br>SYSTEM
                </h2>        
                <ul>
                    <li class="side-list"><a href="/dashboard.html" class="side-link"><img class="sbar-logo" src="https://img.icons8.com/?size=100&id=sUJRwjfnGwbJ&format=png&color=000000" width="40" alt=""><b class="sideText">Dashboard</b></a></li>
                    <li class="side-list"><a href="/drivers-info.html" class="side-link"><img class="sbar-logo" src="https://img.icons8.com/?size=100&id=84020&format=png&color=000000" width="40" alt=""><b class="sideText">Drivers Info</b></a></li>
                    <li class="side-list"><a href="/vehicles-in.html" class="side-link"><img class="sbar-logo" src="https://raw.githubusercontent.com/edco-dev/Intellipark-Images/2e161a45b745a345a020913181cacf47501e3b88/toll.svg" width="40" alt=""><b class="sideText">Vehicles In</b></a></li>
                    <li class="side-list"><a href="/register.html" class="side-link"><img class="sbar-logo" src="https://img.icons8.com/?size=100&id=85484&format=png&color=000000" width="40" alt=""><b class="sideText">Register</b></a></li>
                    <li class="side-list"><a href="/history.html" class="side-link"><img class="sbar-logo" src="https://img.icons8.com/?size=100&id=6904&format=png&color=000000" width="40" alt=""><b class="sideText">History</b></a></li>
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
