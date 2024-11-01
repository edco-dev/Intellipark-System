// JavaScript to handle sidebar navigation
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        // Hide all sections
        document.querySelectorAll(".content-section").forEach(section => {
            section.classList.remove("active");
        });

        // Show the clicked section
        const sectionId = event.target.getAttribute("data-section");
        document.getElementById(sectionId).classList.add("active");
    });
});
