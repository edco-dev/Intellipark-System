// polyfills.js
if (typeof window !== 'undefined') {
    window.Buffer = {}; // Initialize Buffer if it's not defined
    window.Buffer.isBuffer = function (obj) {
        return !!(obj && obj.constructor && obj.constructor.isBuffer);
    };
    // Define any other Buffer methods you need here
}
