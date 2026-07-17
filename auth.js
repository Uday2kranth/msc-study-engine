// =========================================================================
// 1. HARDCODED USER ACCESS REGISTRY (Modify your usernames/passwords here)
// =========================================================================
const USER_REGISTRY = {
    "uday_admin": "CryptoMaster2026",  // Your Account
    "peer_active1": "PassMining99!",   // Peer 1
    "peer_active2": "TokensWeb442",    // Peer 2
    "peer_active3": "SentimentKey#1",  // Peer 3
    "peer_active4": "SecureSyllabus7"  // Peer 4
};

// Optional: Paste an n8n webhook or simple monitoring URL here to get instant phone alerts when they log in
const TRACKING_WEBHOOK = "https://your-instance.com/webhook/login-tracker"; 

// =========================================================================
// 2. SESSION VALIDATION ENGINE
// =========================================================================
document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes("login.html");
    const sessionToken = localStorage.getItem("engine_session_active");
    const loggedUser = localStorage.getItem("engine_session_user");

    // Route Protection: If not logged in and trying to view content, bounce to login
    if (!sessionToken && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }

    // Anti-Sharing Double Check: Guard against manual token tampering
    if (sessionToken && !USER_REGISTRY[loggedUser]) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    // Handle Form Submission inside login.html
    if (isLoginPage) {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const inputId = document.getElementById("userId").value.trim();
                const inputPass = document.getElementById("password").value;
                const errorBlock = document.getElementById("errorBlock");

                if (USER_REGISTRY[inputId] && USER_REGISTRY[inputId] === inputPass) {
                    // Generate Session Tokens
                    localStorage.setItem("engine_session_active", "true_" + Math.random().toString(36).substring(2));
                    localStorage.setItem("engine_session_user", inputId);

                    // Capture fingerprint metadata to catch password-sharers
                    const trackingData = {
                        user: inputId,
                        device: navigator.userAgent, 
                        platform: navigator.platform,
                        time: new Date().toLocaleString()
                    };

                    console.log("Access Verified for:", inputId);
                    
                    // Fire-and-forget tracking webhook log
                    if (!TRACKING_WEBHOOK.includes("your-instance")) {
                        fetch(TRACKING_WEBHOOK, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(trackingData)
                        }).catch(() => {/* Suppress local network blocks */});
                    }

                    // Proceed to main dashboard
                    window.location.href = "index.html";
                } else {
                    errorBlock.style.display = "block";
                }
            });
        }
    }
});

// Structural Logout function to expose to UI elements if desired
function terminateSession() {
    localStorage.clear();
    window.location.href = "login.html";
}