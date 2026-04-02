let userWallet = "";
window.currentAgents = [];

// ================= HANDLE CONNECT =================
function handleConnect(){
    if(userWallet){

        showModal(
            "DISCONNECT",
            "Do you want to disconnect wallet?",
            [
                { text:"CANCEL", action:()=>{} },
                { text:"CONFIRM", action: confirmDisconnect }
            ]
        );

    } else {
        connectWallet();
    }
}

// ================= CONNECT WALLET =================
async function connectWallet(){

    if(!window.ethereum){
        alert("Install MetaMask");
        return;
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });

    if(chainId !== "0x38"){
        try{
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x38" }]
            });
        }catch(err){
            alert("Switch to BSC first");
            return;
        }
    }

    const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
    });

    userWallet = accounts[0].toLowerCase();

    document.getElementById("walletAddress").innerText = userWallet;
    document.getElementById("connectBtn").innerText = "CONNECTED";

    loadAgents();
}

function showModal(title, message, buttons){

    const modal = document.getElementById("globalModal");

    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;

    const actions = document.getElementById("modalActions");
    actions.innerHTML = "";

    buttons.forEach(btn => {
        const b = document.createElement("button");
        b.innerText = btn.text;
        b.onclick = () => {
            btn.action();
            closeGlobalModal();
        };
        actions.appendChild(b);
    });

    modal.style.display = "flex";
}

function closeGlobalModal(){
    document.getElementById("globalModal").style.display = "none";
}
// ================= DISCONNECT =================
function confirmDisconnect(){
    userWallet = "";
    document.getElementById("walletAddress").innerText = "NOT CONNECTED";
    document.getElementById("connectBtn").innerText = "CONNECT WALLET";
    document.getElementById("agentList").innerHTML = "";
    document.getElementById("disconnectModal").style.display = "none";
}

function cancelDisconnect(){
    document.getElementById("disconnectModal").style.display = "none";
}

// ================= LOAD AGENTS =================
async function loadAgents(){

    if(!userWallet){
        alert("Connect wallet first");
        return;
    }

    document.getElementById("loader").style.display = "flex";

    const res = await fetch("backend/dashboard_data.php?wallet=" + userWallet);
    const data = await res.json();

    window.currentAgents = data;

    const container = document.getElementById("agentList");
    container.innerHTML = "";

    document.getElementById("loader").style.display = "none";

    if(data.length === 0){
        container.innerHTML = "<p>No agents found</p>";
        return;
    }

    data.forEach(agent => {

        const img = agent.profile_image || agent.image || "assets/pokebook.png";

        const label = agent.type === "super_agent"
            ? "SUPER pCLAW"
            : "pCLAW AGENT";

        const el = document.createElement("div");
        el.className = "agent-card";

        el.innerHTML = `
            <div class="agent-header">
                <div class="agent-left">
                    <img src="${img}" class="agent-img">
                    <div>
                        <div class="agent-name">
                            ${agent.agent_name}
                            ${agent.verify === "yes"
                                ? '<i class="fa-solid fa-certificate verified-badge"></i>'
                                : ''
                            }
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
}
function openProfile(username){
    if(!username){
        alert("Username not found");
        return;
    }

    const url = `https://pokebookai.com/profile?username=${encodeURIComponent(username)}`;
    window.location.href = url;
}
// ================= EDIT =================
function editAgent(id,type){

    const a = currentAgents.find(x=>x.id==id && x.type==type);

    if(!a) return;

    edit_id.value = id;
    edit_type.value = type;

    edit_name.value = a.agent_name || "";
    edit_username.value = a.username || "";
    edit_token.value = a.token_address || "";

    // RESET ALL
    document.querySelector(".agents-only").style.display = "none";
    document.querySelector(".super-only").style.display = "none";
    document.querySelector(".telegram-only").style.display = "none";

    if(type === "agent"){
        document.querySelector(".agents-only").style.display = "block";
    }

    if(type === "super_agent"){
        document.querySelector(".super-only").style.display = "block";

        edit_image_url.value = a.image || "";
        edit_platform_locked.value = a.platform || "-";

        if(a.platform === "telegram"){
            document.querySelector(".telegram-only").style.display = "block";
            edit_telegram_token.value = a.telegram_bot_token || "";
        }
    }

    editModal.style.display = "flex";
}

// ================= SAVE =================
async function saveEdit(){

    const type = edit_type.value;

    if(type === "agent"){

        const form = new FormData();
        form.append("action","edit_full");
        form.append("type","agent");
        form.append("id",edit_id.value);
        form.append("agent_name",edit_name.value);
        form.append("username",edit_username.value);
        form.append("token_address",edit_token.value);

        if(edit_file.files[0]){
            form.append("file", edit_file.files[0]);
        }

        await fetch("backend/dashboard_data.php",{
            method:"POST",
            body: form
        });

    } else {

        const payload = {
            action:"edit_full",
            type:"super_agent",
            id:edit_id.value,
            agent_name:edit_name.value,
            username:edit_username.value,
            token_address:edit_token.value,
            image:edit_image_url.value
        };

        // 
        if(document.getElementById("edit_platform_locked").value === "telegram"){
            payload.telegram_bot_token = edit_telegram_token.value;
        }

        await fetch("backend/dashboard_data.php",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(payload)
        });
    }

    closeModal();
    loadAgents();
}

// ================= DELETE =================
async function deleteAgent(id,type){

    showModal(
        "DELETE",
        "Are you sure you want to delete this agent?",
        [
            {
                text:"CANCEL",
                action:()=>{}
            },
            {
                text:"DELETE",
                action: async ()=>{
                    await fetch("backend/dashboard_data.php",{
                        method:"POST",
                        headers:{ "Content-Type":"application/json" },
                        body: JSON.stringify({ action:"delete", id, type })
                    });

                    loadAgents();

                    showModal("SUCCESS","Agent updated successfully",[
                            { text:"OK", action:()=>{} }
                        ]);
                }
            }
        ]
    );
}

// ================= CLOSE =================
function closeModal(){
    editModal.style.display = "none";
}