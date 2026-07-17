// =========================================================================
// 1. CREDENTIAL REGISTRY (Handed out manually to exactly 6 people)
// =========================================================================
const USER_REGISTRY = {
    "Admin@uday": "Superm@n62", 
    "Sai_Kiran": "kiransir@bava",   
    "Gagan": "gagan@kranthi",    
    "Akash": "labbe@kiransir",  
    "Sai_Ram": "sai@ram",
    "Tharun": "mama@kiransir"
};



const TRACKING_ENDPOINT = "/api/notify";

document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes("login.html");
    const sessionToken = localStorage.getItem("engine_session_active");
    const loggedUser = localStorage.getItem("engine_session_user");

    // Route Protection Barrier
    if (!sessionToken && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }

    if (sessionToken && !USER_REGISTRY[loggedUser]) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    // Login Form Processing
    if (isLoginPage) {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const inputId = document.getElementById("userId").value.trim();
                const inputPass = document.getElementById("password").value;
                const errorBlock = document.getElementById("errorBlock");

                if (USER_REGISTRY[inputId] && USER_REGISTRY[inputId] === inputPass) {
                    localStorage.setItem("engine_session_active", "true_" + Math.random().toString(36).substring(2));
                    localStorage.setItem("engine_session_user", inputId);

                    // Send Initial Login Notification
                    fetch(TRACKING_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            eventType: "LOGIN",
                            user: inputId,
                            device: navigator.userAgent,
                            platform: navigator.platform,
                            time: new Date().toLocaleString()
                        })
                    }).catch(() => {});

                    window.location.href = "index.html";
                } else {
                    errorBlock.style.display = "block";
                }
            });
        }
    }

    // =========================================================================
    // 2. TIME-SPENT DURATION TRACKER ENGINE
    // =========================================================================
    if (!isLoginPage && loggedUser) {
        let startTime = Date.now();

        const sendDurationAlert = () => {
            const endTime = Date.now();
            const timeSpentSeconds = Math.round((endTime - startTime) / 1000);

            if (timeSpentSeconds > 2) { // Only log if they stay longer than 2 seconds
                const payload = {
                    eventType: "DURATION",
                    user: loggedUser,
                    page: window.location.pathname.split("/").pop() || "index.html",
                    duration: timeSpentSeconds,
                    time: new Date().toLocaleString()
                };

                // keepalive: true ensures the browser sends this event even if the tab closes
                fetch(TRACKING_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => {});
            }
        };

        // Track when user closes the tab, refreshes, or leaves the page
        window.addEventListener("beforeunload", sendDurationAlert);
        
        // Track when user switches tabs or minimizes the browser window
        document.addEventListener("visibilitychange", function() {
            if (document.visibilityState === "hidden") {
                sendDurationAlert();
            } else {
                startTime = Date.now(); // Reset timer when they return to the tab
            }
        });
    }
});

function terminateSession() {
    localStorage.clear();
    window.location.href = "login.html";
}