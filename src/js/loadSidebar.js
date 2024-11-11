// import { logoutUser } from '/src/scripts/auth/logout.js';

// class Sidebar extends HTMLElement {
//     connectedCallback() {
//         this.innerHTML = `
//             <nav class="bg-black w-[250px] h-full p-6 flex flex-col text-gray-800 rounded-lg mt-20 ml-20 mr-20 mb-20 shadow-lg">
//                 <!-- Logo and Title -->
//                 <div class="flex items-center mb-10">
//                     <img src="https://raw.githubusercontent.com/edco-dev/Intellipark-Images/2e161a45b745a345a020913181cacf47501e3b88/carLogo.svg" width="40" alt="logo" class="mr-4">
//                     <h2 class="text-2xl font-semibold">INTELLIPARK SYSTEM</h2>
//                 </div>

//                 <!-- Sidebar Menu Items -->
//                 <ul class="flex flex-col space-y-4">
//                     <li>
//                         <a href="/dashboard.html" class="flex items-center p-3 text-gray-800 hover:bg-[#49a5ff] rounded-lg transition-all">
//                             <img src="https://img.icons8.com/?size=100&id=sUJRwjfnGwbJ&format=png&color=000000" width="30" alt="Dashboard" class="mr-4">
//                             <span class="text-lg font-medium">Dashboard</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a href="/drivers-info.html" class="flex items-center p-3 text-gray-800 hover:bg-[#49a5ff] rounded-lg transition-all">
//                             <img src="https://img.icons8.com/?size=100&id=84020&format=png&color=000000" width="30" alt="Drivers Info" class="mr-4">
//                             <span class="text-lg font-medium">Drivers Info</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a href="/vehicles-in.html" class="flex items-center p-3 text-gray-800 hover:bg-[#49a5ff] rounded-lg transition-all">
//                             <img src="https://raw.githubusercontent.com/edco-dev/Intellipark-Images/2e161a45b745a345a020913181cacf47501e3b88/toll.svg" width="30" alt="Vehicles In" class="mr-4">
//                             <span class="text-lg font-medium">Vehicles In</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a href="/register.html" class="flex items-center p-3 text-gray-800 hover:bg-[#49a5ff] rounded-lg transition-all">
//                             <img src="https://img.icons8.com/?size=100&id=85484&format=png&color=000000" width="30" alt="Register" class="mr-4">
//                             <span class="text-lg font-medium">Register</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a href="/history.html" class="flex items-center p-3 text-gray-800 hover:bg-[#49a5ff] rounded-lg transition-all">
//                             <img src="https://img.icons8.com/?size=100&id=6904&format=png&color=000000" width="30" alt="History" class="mr-4">
//                             <span class="text-lg font-medium">History</span>
//                         </a>
//                     </li>
//                 </ul>

//                 <!-- Logout Button -->
//                 <p class="text-red-600 font-bold text-center cursor-pointer mt-auto py-3" id="logoutButton">Logout</p>
//             </nav>
//         `;
        
//         const logoutButton = this.querySelector('#logoutButton');
//         if (logoutButton) {
//             logoutButton.addEventListener('click', logoutUser);
//         }
//     }
// }

// customElements.define('app-sidebar', Sidebar);
