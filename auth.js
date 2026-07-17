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

    // Run layout control engine on DOM ready
    initializeUiEngine();
});

function terminateSession() {
    localStorage.clear();
    window.location.href = "login.html";
}

// =========================================================================
// 3. PERSISTENT LIGHT THEME & MOBILE MOCKUP ENGINE
// =========================================================================
function initializeUiEngine() {
    // 1. Inject Stylesheets
    const styles = `
        /* Light Theme Overrides */
        body.light-theme {
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --text-main: #0f172a;
            --text-muted: #475569;
            --border: #cbd5e1;
            --accent-primary: #4f46e5;
        }
        body.light-theme .card {
            background: linear-gradient(135deg, #eef2ff 0%, #ffffff 100%) !important;
            border-color: var(--accent-primary) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        body.light-theme .card p,
        body.light-theme .card div,
        body.light-theme .card strong:not(.badge),
        body.light-theme .card li,
        body.light-theme .card span:not(.badge) {
            color: #334155 !important;
        }
        body.light-theme .grid-item {
            background: #ffffff !important;
            border-color: var(--border) !important;
        }
        body.light-theme .unit-box {
            background-color: #ffffff !important;
            border-color: var(--border) !important;
        }
        body.light-theme .unit-title {
            color: #1e293b !important;
            border-bottom-color: var(--border) !important;
        }
        body.light-theme .nav-link:not(.active) {
            background-color: #e2e8f0 !important;
            color: #475569 !important;
            border-color: #cbd5e1 !important;
        }
        body.light-theme .nav-link:not(.active):hover {
            border-color: var(--accent-primary) !important;
            color: #0f172a !important;
        }
        body.light-theme .badge-overlap {
            color: #000000 !important;
        }
        body.light-theme .overlap-note {
            background-color: rgba(245, 158, 11, 0.05) !important;
        }
        body.light-theme .set-box {
            background: rgba(99, 102, 241, 0.02) !important;
        }
        body.light-theme input, body.light-theme select, body.light-theme textarea {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border-color: var(--border) !important;
        }

        /* Floating Controller styling */
        .engine-ui-controller {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1.5px solid var(--accent-primary);
            border-radius: 12px;
            padding: 10px;
            display: flex;
            gap: 10px;
            z-index: 999999;
            box-shadow: 0 15px 30px rgba(0,0,0,0.4);
            font-family: system-ui, -apple-system, sans-serif;
        }
        body.light-theme .engine-ui-controller {
            background: rgba(255, 255, 255, 0.85);
            border-color: var(--accent-primary);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .ui-ctrl-btn {
            border: 1px solid var(--border);
            background-color: rgba(30, 41, 59, 0.8);
            color: #cbd5e1;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .ui-ctrl-btn:hover {
            border-color: var(--accent-primary);
            color: #ffffff;
            transform: translateY(-1px);
        }
        body.light-theme .ui-ctrl-btn {
            background-color: #f1f5f9;
            color: #475569;
            border-color: #cbd5e1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        body.light-theme .ui-ctrl-btn:hover {
            color: #0f172a;
            border-color: var(--accent-primary);
        }

        /* Active buttons (obviously active and clicked) */
        .ui-ctrl-btn.active {
            background-color: var(--accent-primary) !important;
            border-color: var(--accent-primary) !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
        }
        body.light-theme .ui-ctrl-btn.active {
            background-color: var(--accent-primary) !important;
            border-color: var(--accent-primary) !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
        }

        /* Mobile structure mockup framework (5.5 - 7 inch screens) */
        body.mobile-frame-active {
            max-width: 450px !important;
            margin: 2.5rem auto !important;
            border: 14px solid #1e293b !important;
            border-radius: 40px !important;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6) !important;
            padding: 3.5rem 1.5rem 2rem 1.5rem !important;
            position: relative;
            background-color: var(--bg-main) !important;
            overflow-x: hidden !important;
        }
        body.light-theme.mobile-frame-active {
            border-color: #64748b !important;
            box-shadow: 0 30px 60px rgba(0,0,0,0.15) !important;
        }
        /* Mobile Speaker/Camera Notch */
        body.mobile-frame-active::before {
            content: "";
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 130px;
            height: 22px;
            background-color: #1e293b;
            border-radius: 12px;
            z-index: 9999999;
        }
        body.light-theme.mobile-frame-active::before {
            background-color: #64748b;
        }
        /* Lock HTML layout in mobile frame view */
        html.mobile-html-locked {
            background-color: #020617;
            min-height: 100vh;
        }
        html.light-theme.mobile-html-locked {
            background-color: #e2e8f0;
        }
    `;

    const styleEl = document.createElement("style");
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    // 2. Inject floating controller layout
    const panel = document.createElement("div");
    panel.className = "engine-ui-controller";
    panel.innerHTML = `
        <button id="themeToggleBtn" class="ui-ctrl-btn" title="Toggle Light/Dark Theme">
            <span>☀️</span> Theme
        </button>
        <button id="mobileToggleBtn" class="ui-ctrl-btn" title="Simulate 5.5-7 inch Mobile Device View">
            <span>📱</span> Mobile View
        </button>
    `;
    document.body.appendChild(panel);

    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const mobileToggleBtn = document.getElementById("mobileToggleBtn");
    const headerThemeBtn = document.getElementById("headerThemeToggleBtn");
    const headerMobileBtn = document.getElementById("headerMobileToggleBtn");

    // 3. Functions to apply states
    const applyTheme = (isLight) => {
        if (isLight) {
            document.body.classList.add("light-theme");
            document.documentElement.classList.add("light-theme");
            themeToggleBtn.classList.add("active");
            themeToggleBtn.innerHTML = `<span>🌙</span> Dark Mode`;
            if (headerThemeBtn) {
                headerThemeBtn.classList.add("active");
                headerThemeBtn.innerHTML = `<span>🌙</span> Dark Mode`;
            }
        } else {
            document.body.classList.remove("light-theme");
            document.documentElement.classList.remove("light-theme");
            themeToggleBtn.classList.remove("active");
            themeToggleBtn.innerHTML = `<span>☀️</span> Light Mode`;
            if (headerThemeBtn) {
                headerThemeBtn.classList.remove("active");
                headerThemeBtn.innerHTML = `<span>☀️</span> Light Mode`;
            }
        }
    };

    const applyMobileView = (isMobile) => {
        if (isMobile) {
            document.body.classList.add("mobile-frame-active");
            document.documentElement.classList.add("mobile-html-locked");
            mobileToggleBtn.classList.add("active");
            mobileToggleBtn.innerHTML = `<span>🖥️</span> Desktop View`;
            if (headerMobileBtn) {
                headerMobileBtn.classList.add("active");
                headerMobileBtn.innerHTML = `<span>🖥️</span> Desktop View`;
            }
        } else {
            document.body.classList.remove("mobile-frame-active");
            document.documentElement.classList.remove("mobile-html-locked");
            mobileToggleBtn.classList.remove("active");
            mobileToggleBtn.innerHTML = `<span>📱</span> Mobile View`;
            if (headerMobileBtn) {
                headerMobileBtn.classList.remove("active");
                headerMobileBtn.innerHTML = `<span>📱</span> Mobile View`;
            }
        }
    };

    // 4. Initialize states from localStorage
    const savedThemeLight = localStorage.getItem("engine_theme_light") === "true";
    const savedMobileView = localStorage.getItem("engine_mobile_view") === "true";

    applyTheme(savedThemeLight);
    applyMobileView(savedMobileView);

    // 5. Click Handlers
    const handleThemeClick = () => {
        const isCurrentlyLight = document.body.classList.contains("light-theme");
        const nextLight = !isCurrentlyLight;
        applyTheme(nextLight);
        localStorage.setItem("engine_theme_light", nextLight);
    };

    const handleMobileClick = () => {
        const isCurrentlyMobile = document.body.classList.contains("mobile-frame-active");
        const nextMobile = !isCurrentlyMobile;
        applyMobileView(nextMobile);
        localStorage.setItem("engine_mobile_view", nextMobile);
    };

    themeToggleBtn.addEventListener("click", handleThemeClick);
    mobileToggleBtn.addEventListener("click", handleMobileClick);

    if (headerThemeBtn) {
        headerThemeBtn.addEventListener("click", handleThemeClick);
    }
    if (headerMobileBtn) {
        headerMobileBtn.addEventListener("click", handleMobileClick);
    }
}