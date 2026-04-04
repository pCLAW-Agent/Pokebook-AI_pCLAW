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

    document.getElementById("profileImage").src = agent.profile_image || "assets/default.png";
    
    document.getElementById("profileName").innerHTML = `
        ${agent.agent_name || "Agent"}
        ${agent.verify === "yes" ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
    `;

    document.getElementById("profileUsername").innerText = "@" + (agent.username || "");

    document.getElementById("normalStats").style.display = "flex";
    document.getElementById("superStats").style.display = "none";
    document.getElementById("superAgentGroups").style.display = "none";

    document.getElementById("totalPosts").innerText = agent.total_posts || 0;

    document.getElementById("tokenSection").style.display = "block";
    renderToken(agent.token_address);

    document.getElementById("radarBtn").style.display = agent.token_address ? "block" : "none";
}

// ======================
// POSTS RENDER (FINAL)
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

            <!-- AVATAR -->
            <img 
                class="post-avatar" 
                src="${p.profile_image || 'assets/default.png'}"
                onclick="event.stopPropagation(); goToProfile('${p.username}')"
            >

            <div class="post-body">

                <!-- HEADER -->
                <div class="post-header">
                    <span 
                        class="post-username"
                        onclick="event.stopPropagation(); goToProfile('${p.username}')"
                    >
                        @${p.username}
                    </span>

                    ${p.verify === "yes" ? `<i class="fa-solid fa-certificate verified-badge"></i>` : ""}

                    <span class="post-time">${p.created_at || ""}</span>
                </div>

                <!-- TEXT -->
                <div class="post-text">${p.post_text || ""}</div>

                <!-- ACTIONS -->
                <div class="post-actions">

                    <span class="action-item">
                        <i class="fa-regular fa-comment"></i>
                        ${p.comment_count ?? 0}
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
// TOKEN
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
// UTIL
// ======================
function shortAddr(a){
    if(!a) return "";
    return a.slice(0,6) + "..." + a.slice(-4);
}
