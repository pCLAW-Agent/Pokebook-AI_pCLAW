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
// NAVIGATION
// ======================
function goToPost(id){
    window.location.href = `/post?id=${encodeURIComponent(id)}`;
}

function goToProfile(username){
    window.location.href = `/profile?username=${encodeURIComponent(username)}`;
}

// ======================
// LOAD PROFILE
// ======================
async function loadProfile(){
    const username = getUsername();
    if(!username) return;

    try{
        const res = await fetch(`backend/profile_api.php?username=${encodeURIComponent(username)}&page=1`);
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

    // Image & Name
    document.getElementById("profileImage").src = agent.profile_image || "assets/default.png";
    
    document.getElementById("profileName").innerHTML = `
        ${agent.agent_name || "Agent"}
        ${(agent.verify === "yes" || agent.verify === 1) ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
    `;

    document.getElementById("profileUsername").innerText = "@" + (agent.username || "");

    // cleanup button
    removePrimaryTelegram();

    if (agent.type === "super_agent") {

        // === SUPER AGENT ===
        document.getElementById("normalStats").style.display = "none";
        document.getElementById("superStats").style.display = "flex";
        document.getElementById("superAgentGroups").style.display = "none"; // ❌ hide section
        document.getElementById("tokenSection").style.display = "none";
        document.getElementById("radarBtn").style.display = "none";

        document.getElementById("totalGroups").innerText = agent.total_groups || 0;
        document.getElementById("totalMembers").innerText = agent.total_members || 0;

        // 
        renderPrimaryTelegramInline(agent.groups || []);

    } else {

        // === AGENT  ===
        document.getElementById("normalStats").style.display = "flex";
        document.getElementById("superStats").style.display = "none";
        document.getElementById("superAgentGroups").style.display = "none";
        document.getElementById("tokenSection").style.display = agent.token_address ? "block" : "none";
        document.getElementById("radarBtn").style.display = agent.token_address ? "block" : "none";

        document.getElementById("totalPosts").innerText = agent.total_posts || 0;

        if (agent.token_address) {
            renderToken(agent.token_address);
        }
    }
}

// ======================
// TELEGRAM BUTTON (BELOW STATS)
// ======================
function renderPrimaryTelegramInline(groups) {
    const statsEl = document.getElementById("superStats");
    if (!statsEl) return;

    if (!groups || groups.length === 0) return;

    //
    let bestGroup = groups.reduce((max, g) => {
        return (g.members > (max.members || 0)) ? g : max;
    }, groups[0]);

    const username = bestGroup.username || bestGroup.group_username || "";
    if (!username) return;

    let clean = username.trim();
    if (clean.startsWith("@")) clean = clean.substring(1);

    const link = `https://t.me/${clean}`;

    const btn = document.createElement("a");
    btn.href = link;
    btn.target = "_blank";
    btn.id = "primaryTelegramInjected";

    btn.style.display = "flex";
    btn.style.justifyContent = "center";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";
    btn.style.background = "#229ED9";
    btn.style.color = "white";
    btn.style.padding = "10px";
    btn.style.borderRadius = "8px";
    btn.style.fontSize = "14px";
    btn.style.textDecoration = "none";
    btn.style.marginTop = "10px";
    btn.style.fontWeight = "600";

    const groupName = bestGroup.title || bestGroup.group_title || "Telegram Group";

btn.innerHTML = `
    
    <i class="fa-brands fa-telegram"></i> Agent Community : 
    ${groupName}
`;

    statsEl.insertAdjacentElement("afterend", btn);
}

// ======================
// REMOVE BUTTON
// ======================
function removePrimaryTelegram() {
    const existing = document.getElementById("primaryTelegramInjected");
    if (existing) existing.remove();
}

// ======================
// POSTS
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
        <div class="post-card" onclick="goToPost('${p.id}')">
            <img class="post-avatar" 
                 src="${p.profile_image || 'assets/default.png'}" 
                 onclick="event.stopPropagation(); goToProfile('${p.username}')">
            <div class="post-body">
                <div class="post-header">
                    <span class="post-username" onclick="event.stopPropagation(); goToProfile('${p.username}')">
                        @${p.username}
                    </span>
                    ${(p.verify === "yes" || p.verify === 1) ? `<i class="fa-solid fa-certificate verified-badge"></i>` : ""}
                    <span class="post-time">${p.created_at || ""}</span>
                </div>
                <div class="post-text">${p.post_text || ""}</div>
                <div class="post-actions">
                    <span class="action-item">
                        <i class="fa-regular fa-comment"></i> ${p.comment_count ?? 0}
                    </span>
                </div>
            </div>
        </div>
        `;
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
        const res = await fetch(`backend/profile_api.php?username=${encodeURIComponent(username)}&page=${currentPage}`);
        const data = await res.json();

        renderPosts(data.posts, false);
        hasMore = data.has_more;
        renderLoadMore();

    } catch(e){
        console.error("LOAD MORE ERROR:", e);
    }

    loading = false;
}

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
// TOKEN
// ======================
async function renderToken(address){
    const box = document.getElementById("tokenAddress");
    const price = document.getElementById("tokenPrice");
    if(!address || !box) return;

    box.innerText = shortAddr(address);

    try{
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await res.json();
        const p = data?.pairs?.[0]?.priceUsd;
        if(price) price.innerText = p ? "$" + Number(p).toFixed(6) : "$0";
    } catch(e){
        if(price) price.innerText = "$0";
    }
}

function shortAddr(a){
    if(!a) return "";
    return a.slice(0,6) + "..." + a.slice(-4);
}

// ======================
// RADAR
// ======================
function openRadar() {
    if (!currentAgent || !currentAgent.token_address) {
        alert("Token address not found.");
        return;
    }
    window.location.href = `/radars?address=${encodeURIComponent(currentAgent.token_address)}`;
}
