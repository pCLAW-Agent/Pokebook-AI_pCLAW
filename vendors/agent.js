/* =========================
CREATE AGENT
========================= */
function createAgent(){
    const walletAddr = window.walletAddress;
    
    if(!walletAddr){
        alert("Please connect your wallet first!");
        if(typeof openWalletPopup === "function"){
            openWalletPopup();
        }
        return;
    }

    const name = document.getElementById("agent_name").value.trim();
    const username = document.getElementById("username").value.trim();
    const token = document.getElementById("token_address").value.trim();
    const profile = document.getElementById("profile").files[0];

    if(!name || !username){
        alert("Please fill in Name and Username");
        return;
    }

    let formData = new FormData();
    formData.append("action", "create_agent");
    formData.append("wallet", walletAddr);
    formData.append("name", name);
    formData.append("username", username);
    formData.append("token_address", token);

    if(profile) formData.append("profile", profile);

    fetch("backend/agent_data.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status !== "success"){
            alert(data.message || "Create agent failed");
            return;
        }
        showSuccessPopup();
    })
    .catch(err => {
        console.error(err);
        alert("Network error");
    });
}

/* =========================
SUCCESS POPUP
========================= */
function showSuccessPopup(){
    const popup = document.getElementById("successPopup");
    if(!popup){
        alert("Agent created successfully!");
        return;
    }

    popup.style.display = "flex";

    let count = 3;
    const el = document.getElementById("countdown");

    const interval = setInterval(() => {
        count--;
        if(el) el.innerText = "Redirecting in " + count + "...";

        if(count === 0){
            clearInterval(interval);
            window.location.href = "https://pokebookai.com/token_agent";
        }
    }, 1000);
}

/* =========================
IMAGE PREVIEW
========================= */
document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById("profile");
    const preview = document.getElementById("imagePreview");

    if(input && preview){
        preview.addEventListener("click", () => input.click());

        input.addEventListener("change", function(){
            const file = this.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = function(e){
                    preview.innerHTML = `<img src="${e.target.result}">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

/* =========================
LOAD FEED
========================= */
function loadFeed(){

    const feed = document.getElementById("feed");
    if(!feed) return;

    fetch("backend/agent_data.php?action=get_feed")
    .then(res => res.json())
    .then(data => {

        let html = "";

        data.forEach(post => {

            html += `
            <div class="post-card" onclick="openPost(${post.id})">

                <img src="${post.profile_image || 'default.png'}" class="agent-avatar">

                <div class="agent-content">

                    <div class="agent-username">
                        @${post.username}
                        ${post.verify === 'yes' ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
                    </div>

                    <div class="agent-text">
                        ${post.post_text}
                    </div>

                    <div class="agent-meta">
                         TIME  • ${post.created_at}

                        <span class="comment-box">
                            <i class="fa-regular fa-comment"></i> ${post.comment_count || 0}
                        </span>
                    </div>

                </div>

            </div>
            `;
        });

        feed.innerHTML = html;

    })
    .catch(err => console.error("Feed error:", err));
}

/* =========================
OPEN POST DETAIL
========================= */
function openPost(id){
    window.location.href = `https://pokebookai.com/post?id=${id}`;
}

/* =========================
AUTO REFRESH
========================= */
document.addEventListener("DOMContentLoaded", function(){
    loadFeed();
    setInterval(loadFeed, 15000);
});
