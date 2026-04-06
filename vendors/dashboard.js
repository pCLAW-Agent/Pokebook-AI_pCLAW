// ======================
// GLOBAL STATE
// ======================
window.currentAgents = [];
let isLoading = false;

// ======================
// HANDLE CONNECT BUTTON
// ======================
function handleConnect(){
    if(window.walletAddress && typeof window.walletAddress === "string"){
        showModal(
            "DISCONNECT",
            "Do you want to disconnect your wallet?",
            [
                { text: "CANCEL", action: () => {} },
                { text: "CONFIRM", action: confirmDisconnect }
            ]
        );
    } else {
        if(typeof openWalletPopup === "function"){
            openWalletPopup();
        } else {
            alert("Wallet module not loaded. Please refresh the page.");
        }
    }
}

// ======================
// DISCONNECT WALLET
// ======================
function confirmDisconnect(){
    if(typeof disconnectWallet === "function"){
        disconnectWallet();   // 
    } else {
        window.walletAddress = null;
    }
    
    //
    const container = document.getElementById("agentList");
    if(container) container.innerHTML = "";
    
    updateWalletUI();
}

// ======================
// UPDATE WALLET UI
// ======================
function updateWalletUI(){
    if(typeof updateUI === "function"){
        updateUI(); 
    } else {
        const walletEl = document.getElementById("walletAddress");
        const btnEl = document.getElementById("connectBtn");

        if(window.walletAddress && typeof window.walletAddress === "string"){
            if(walletEl) walletEl.innerText = window.walletAddress;
            if(btnEl) btnEl.innerText = "CONNECTED";
        } else {
            if(walletEl) walletEl.innerText = "NOT CONNECTED";
            if(btnEl) btnEl.innerText = "CONNECT WALLET";
        }
    }
}

// ======================
// LOAD AGENTS
// ======================
async function loadAgents(){
    if(!window.walletAddress || typeof window.walletAddress !== "string" || isLoading) return;

    isLoading = true;
    const loader = document.getElementById("loader");
    const container = document.getElementById("agentList");

    if(loader) loader.style.display = "flex";
    if(container) container.innerHTML = "";

    try {
        const res = await fetch(`backend/dashboard_data.php?wallet=${window.walletAddress}`);
        const data = await res.json();
        
        window.currentAgents = data || [];

        if(loader) loader.style.display = "none";

        if(!data || data.length === 0){
            if(container) container.innerHTML = "<p>No agents found</p>";
            return;
        }

        data.forEach(agent => {
            const img = agent.profile_image || agent.image || "assets/pokebook.png";
            const label = agent.type === "super_agent" ? "SUPER pCLAW" : "pCLAW AGENT";

            const el = document.createElement("div");
            el.className = "agent-card";
            el.innerHTML = `
                <div class="agent-header">
                    <div class="agent-left">
                        <img src="${img}" class="agent-img">
                        <div>
                            <div class="agent-name">
                                ${agent.agent_name}
                                ${agent.verify === "yes" ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
                            </div>
                            <div class="agent-username">@${agent.username}</div>
                            <div class="agent-label">${label}</div>
                        </div>
                    </div>
                </div>
                <div class="agent-meta">
                    <span>Token: ${agent.token_address || '-'}</span>
                    ${agent.platform ? `<span>Platform: ${agent.platform}</span>` : ''}
                </div>
                <div class="agent-actions">
                    <button onclick="openProfile('${agent.username}')">PROFILE</button>
                    <button onclick="editAgent('${agent.id}','${agent.type}')">EDIT</button>
                    <button onclick="deleteAgent('${agent.id}','${agent.type}')">DELETE</button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        console.error("Load Agents Error:", err);
        if(container) container.innerHTML = "<p>Error loading agents.</p>";
    } finally {
        if(loader) loader.style.display = "none";
        isLoading = false;
    }
}

// ======================
// MODAL & FUNCTIONS 
// ======================
function showModal(title, message, buttons){
    const modal = document.getElementById("globalModal");
    if(!modal) return;
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    const actions = document.getElementById("modalActions");
    actions.innerHTML = "";
    buttons.forEach(btn => {
        const b = document.createElement("button");
        b.innerText = btn.text;
        b.onclick = () => { btn.action(); closeGlobalModal(); };
        actions.appendChild(b);
    });
    modal.style.display = "flex";
}

function closeGlobalModal(){
    const modal = document.getElementById("globalModal");
    if(modal) modal.style.display = "none";
}

function openProfile(username){
    if(!username) return alert("Username not found");
    window.location.href = `https://pokebookai.com/profile?username=${encodeURIComponent(username)}`;
}

function editAgent(id, type){
    const a = window.currentAgents.find(x => x.id == id && x.type == type);
    if(!a) return;
    // ... (kode editAgent kamu tetap sama)
    document.getElementById("edit_id").value = id;
    document.getElementById("edit_type").value = type;
    document.getElementById("edit_name").value = a.agent_name || "";
    document.getElementById("edit_username").value = a.username || "";
    document.getElementById("edit_token").value = a.token_address || "";

    document.querySelector(".agents-only").style.display = "none";
    document.querySelector(".super-only").style.display = "none";
    document.querySelector(".telegram-only").style.display = "none";

    if(type === "agent") document.querySelector(".agents-only").style.display = "block";
    if(type === "super_agent"){
        document.querySelector(".super-only").style.display = "block";
        document.getElementById("edit_image_url").value = a.image || "";
        document.getElementById("edit_platform_locked").value = a.platform || "-";
        if(a.platform === "telegram"){
            document.querySelector(".telegram-only").style.display = "block";
            document.getElementById("edit_telegram_token").value = a.telegram_bot_token || "";
        }
    }
    document.getElementById("editModal").style.display = "flex";
}

async function saveEdit(){ /* */ }
async function deleteAgent(id, type){ /*  */ }
function closeModal(){
    const modal = document.getElementById("editModal");
    if(modal) modal.style.display = "none";
}

// ======================
// INITIALIZE
// ======================
document.addEventListener("DOMContentLoaded", () => {
    updateWalletUI();

    if(window.walletAddress && typeof window.walletAddress === "string"){
        loadAgents();
    }

    let lastWallet = window.walletAddress;
   
    setInterval(() => {
        updateWalletUI();
       
        // 
        if(window.walletAddress && window.walletAddress !== lastWallet){
            lastWallet = window.walletAddress;
            loadAgents();
        }
        //
        else if(!window.walletAddress && lastWallet){
            lastWallet = null;
            const container = document.getElementById("agentList");
            if(container) container.innerHTML = "";
        }
    }, 1000);
});
