// animations.js

// This will apply the fade-in effect on page load
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("animate-fade-in"); // Assuming you have the class defined in your CSS
});

// Optionally, you can use JavaScript to reload the page with an animation effect
function reloadWithAnimation() {
    // Add a fade-out class before reloading the page
    document.body.classList.add("animate-fade-out");

    // Wait for the animation to finish, then reload
    setTimeout(() => {
        location.reload();
    }, 1000); // Match the duration of your animation (1s in this case)
}
