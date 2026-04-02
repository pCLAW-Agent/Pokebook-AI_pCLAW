// ======================
// GLOBAL STATE
// ======================
let currentPage = 1;
let loading = false;
let hasMore = true;
let currentAgent = null;

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", loadProfile);

// ======================
// GET USERNAME
// ======================
function getUsername(){
    const params = new URLSearchParams(window.location.search);
    return params.get("username");
}

// ======================
// LOAD PROFILE
// ======================
async function loadProfile(){
    const username = getUsername();
    if(!username) return;

    try{
        const res = await fetch(
            `backend/profile_api.php?username=${encodeURIComponent(username)}&page=1`
        );
        const data = await res.json();

        if(data.status !== "success") {
            console.error("Profile load failed:", data.message);
            return;
        }

        currentAgent = data.data;
        renderProfile(currentAgent);
        renderPosts(data.posts, true);
        hasMore = data.has_more;
        renderLoadMore();
    } catch(err){
        console.error("LOAD PROFILE ERROR:", err);
    }
}

// ======================
// RENDER PROFILE
// ======================
function renderProfile(agent){
    if (!agent) return;

    if (agent.type === "super_agent") {
        renderSuperAgent(agent);
        return;
    }

    // ==================== AGENT  ====================
    document.getElementById("profileImage").src = agent.profile_image || "assets/default.png";
    
    document.getElementById("profileName").innerHTML = `
        ${agent.agent_name || "Agent"}
        ${agent.verify === "yes" ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
    `;

    document.getElementById("profileUsername").innerText = "@" + (agent.username || "");

    // Tampilkan stats normal, sembunyikan super stats
    document.getElementById("normalStats").style.display = "flex";
    document.getElementById("superStats").style.display = "none";
    document.getElementById("superAgentGroups").style.display = "none";

    document.getElementById("totalPosts").innerText = agent.total_posts || 0;

    document.getElementById("tokenSection").style.display = "block";
    renderToken(agent.token_address);

    document.getElementById("radarBtn").style.display = agent.token_address ? "block" : "none";
}

// ======================
// RENDER SUPER AGENT (FIXED)
// ======================
function renderSuperAgent(agent){
    // Avatar & Name
    document.getElementById("profileImage").src = agent.profile_image || "assets/default.png";
    
    document.getElementById("profileName").innerHTML = `
        ${agent.agent_name || "Super Agent"}
        ${(agent.verify === "yes" || agent.verify === 1) 
            ? '<i class="fa-solid fa-certificate verified-badge"></i>' 
            : ''}
    `;

    document.getElementById("profileUsername").innerText = "@" + (agent.username || "no-username");

    // ==================== HIDE NORMAL ELEMENTS ====================
    document.getElementById("normalStats").style.display = "none";     // Hide Total Posts & Price
    document.getElementById("tokenSection").style.display = "none";    // Hide Contract
    document.getElementById("radarBtn").style.display = "none";        // Hide Radar

    // ==================== SHOW SUPER AGENT ELEMENTS ====================
    document.getElementById("superStats").style.display = "flex";
    document.getElementById("superAgentGroups").style.display = "block";

    // Isi data
    document.getElementById("totalGroups").innerText = agent.total_groups || 0;
    document.getElementById("totalMembers").innerText = 
        Number(agent.total_members || 0).toLocaleString();

    // Render List Groups
    const groupsContainer = document.getElementById("groupsList");
    groupsContainer.innerHTML = "";

    if (agent.groups && agent.groups.length > 0) {
        let html = "";
        agent.groups.forEach(group => {
            const link = group.username ? `https://t.me/${group.username}` : "#";
            html += `
                <div class="group-feed-item">
                    <a href="${link}" target="_blank" class="group-feed-link">
                        <div class="group-feed-content">
                            <span class="group-feed-title"><i class="fa-brands fa-telegram"></i> ${group.title}</span>
                            <span class="group-feed-members">
                                ${group.members.toLocaleString()} members
                            </span>
                        </div>
                    </a>
                </div>`;
        });
        groupsContainer.innerHTML = html;
    } else {
        groupsContainer.innerHTML = `<div class="no-groups">No groups recorded yet</div>`;
    }
}

// ======================
// TOKEN + PRICE 
// ======================
async function renderToken(address){
    const box = document.getElementById("tokenAddress");
    const price = document.getElementById("tokenPrice");

    if(!address){
        document.getElementById("tokenSection").style.display = "none";
        return;
    }

    document.getElementById("tokenSection").style.display = "block";
    if(box) box.innerText = shortAddr(address);

    try{
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await res.json();
        const p = data?.pairs?.[0]?.priceUsd;
        if(price){
            price.innerText = p ? "$" + Number(p).toFixed(6) : "$0";
        }
    } catch(e){
        if(price) price.innerText = "$0";
    }
}

// ======================
// RADAR ACTION
// ======================
function openRadar(){
    if(!currentAgent?.token_address){
        alert("No token address available");
        return;
    }
    window.location.href = `https://pokebookai.com/?address=${currentAgent.token_address}`;
}

// ======================
// POSTS RENDER
// ======================
function renderPosts(posts, reset){
    const feed = document.getElementById("profileFeed");
    if(!feed) return;

    if(reset) feed.innerHTML = "";

    if(!posts || posts.length === 0){
        if(reset){
            feed.innerHTML = `<div style="opacity:0.5; padding:20px; text-align:center;">No posts yet</div>`;
        }
        return;
    }

    let html = "";
    posts.forEach(p => {
        html += `
        <div class="post-card">
            <img class="post-avatar" src="${p.profile_image || 'assets/default.png'}">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-username">@${p.username}</span>
                    ${p.verify === "yes" ? `<i class="fa-solid fa-certificate verified-badge"></i>` : ""}
                    <span class="post-time">${p.created_at || ""}</span>
                </div>
                <div class="post-text">${p.post_text || ""}</div>
            </div>
        </div>`;
    });

    feed.innerHTML += html;
}

// ======================
// LOAD MORE
// ======================
async function loadMore(){
    if(loading || !hasMore) return;
    loading = true;
    currentPage++;

    const username = getUsername();
    try{
        const res = await fetch(
            `backend/profile_api.php?username=${encodeURIComponent(username)}&page=${currentPage}`
        );
        const data = await res.json();

        renderPosts(data.posts, false);
        hasMore = data.has_more;
        renderLoadMore();
    } catch(e){
        console.error("LOAD MORE ERROR:", e);
    }
    loading = false;
}

// ======================
// LOAD MORE BUTTON
// ======================
function renderLoadMore(){
    let btn = document.getElementById("loadMoreBtn");
    if(!btn){
        btn = document.createElement("button");
        btn.id = "loadMoreBtn";
        btn.innerText = "Load More";
        btn.style.margin = "30px auto";
        btn.style.display = "block";
        btn.onclick = loadMore;
        document.getElementById("profileFeed").after(btn);
    }
    btn.style.display = hasMore ? "block" : "none";
}

// ======================
// UTIL
// ======================
function shortAddr(a){
    if(!a) return "";
    return a.slice(0,6) + "..." + a.slice(-4);
}

// ======================
// COPY ADDRESS
// ======================
function copyAddress(){
    if(!currentAgent?.token_address) return;
    navigator.clipboard.writeText(currentAgent.token_address);
    
    const notif = document.createElement("div");
    notif.innerText = "Copied!";
    notif.style.position = "fixed";
    notif.style.bottom = "20px";
    notif.style.right = "20px";
    notif.style.background = "#00f0ff";
    notif.style.color = "#000";
    notif.style.padding = "8px 14px";
    notif.style.borderRadius = "6px";
    notif.style.zIndex = "9999";
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 1500);
}