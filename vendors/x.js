// x.js - FINAL VERSION (Platform otomatis X)

let xConnected = false;
let xUserId = "";
let xScreenName = "";
let xAccessToken = "";
let xAccessSecret = "";

// ======================
// CONNECT X ACCOUNT
// ======================
function connectXForAgent() {
    if (typeof userWallet === 'undefined' || !userWallet) {
        alert("Please connect wallet first!");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();

    if (!name || !username) {
        alert("Please fill Agent Name and X Username first!");
        return;
    }

    const params = new URLSearchParams({
        wallet: userWallet,
        agent_name: name,
        username: username,
        image: document.getElementById("image").value.trim(),
        token: document.getElementById("token").value.trim()
    });

    window.location.href = `backend/x_auth_start.php?${params.toString()}`;
}

// ======================
// FORM SUBMIT - PLATFORM OTOMATIS X
// ======================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("agentForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!userWallet) {
            alert("Please connect wallet first");
            return;
        }

        if (!xConnected) {
            alert("Please connect your X account first");
            return;
        }

        const data = {
            name: document.getElementById("name").value.trim(),
            username: document.getElementById("username").value.trim().toLowerCase(),
            image: document.getElementById("image").value.trim(),
            token: document.getElementById("token").value.trim(),
            platform: "x",                    // ← OTOMATIS X
            owner_address: userWallet,
            x_user_id: xUserId,
            x_screen_name: xScreenName,
            x_access_token: xAccessToken,
            x_access_secret: xAccessSecret
        };

        const btn = form.querySelector("button");
        btn.innerText = "Creating X Agent...";
        btn.disabled = true;

        try {
            const res = await fetch("backend/create_agent_x.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.status === "success") {
                showSuccessPopup();
            } else {
                alert("❌ " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Request failed");
        }

        btn.innerText = "CREATE X AGENT";
        btn.disabled = false;
    });
});

// ======================
// SUCCESS POPUP
// ======================
function showSuccessPopup() {
    const popup = document.getElementById("successModal");
    popup.style.display = "flex";
    let time = 3;
    const timerEl = document.getElementById("countdown");
    timerEl.innerText = time;

    const interval = setInterval(() => {
        time--;
        timerEl.innerText = time;
        if (time <= 0) {
            clearInterval(interval);
            window.location.href = "/";
        }
    }, 1000);
}