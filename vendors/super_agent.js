/* =========================
GLOBAL STORAGE
========================= */
let allSuperAgents = []

/* =========================
LOAD SUPER AGENTS
========================= */
function loadSuperAgents(){
    const container = document.getElementById("superAgents")
    container.innerHTML = "<p>SCANNING SUPER AGENTS...</p>"
    
    fetch("backend/super_data.php")
    .then(res => res.json())
    .then(data => {
        allSuperAgents = data
        renderSuperAgents(data)
    })
    .catch(err => {
        console.error(err)
        container.innerHTML = "<p style='color:#ff4444'>ERROR LOADING SUPER AGENTS</p>"
    })
}

/* =========================
RENDER SUPER AGENTS (DUAL PLATFORM)
========================= */
function renderSuperAgents(data){
    const container = document.getElementById("superAgents")
    let html = ""

    data.forEach(agent => {
        const verified = (agent.verified === 'yes' || agent.verified === 1) 
            ? '<i class="fa-solid fa-certificate verified-badge"></i>' 
            : ''

        const profileLink = `https://pokebookai.com/profile?username=${encodeURIComponent(agent.username || agent.agent_name)}`

        let statsHTML = ''
        let extraHTML = ''

        if (agent.platform === 'telegram') {
            const groupText = `Group : ${agent.group_count} | Users : ${Number(agent.total_members).toLocaleString()}`
            statsHTML = `<span class="super-badge">${groupText}</span>`

            if (agent.top_group && agent.top_group.username) {
                const tgLink = `https://t.me/${agent.top_group.username}`
                extraHTML = `
                    <div class="super-groups-list">
                        Agent on : 
                        <a href="${tgLink}" target="_blank" class="group-link tg-link">
                            <i class="fa-brands fa-telegram"></i> ${agent.top_group.title}
                        </a>
                    </div>`
            } else {
                extraHTML = `<div class="super-groups-list" style="color:#555;">No active groups yet</div>`
            }
        } 
        else if (agent.platform === 'x') {
            statsHTML = `
                <span class="super-badge x-stats">
                    👥 ${Number(agent.followers_count).toLocaleString()} Followers 
                    • ${Number(agent.following_count).toLocaleString()} Following
                </span>
                <span class="super-badge x-stats">
                    📝 ${Number(agent.total_posts).toLocaleString()} Posts 
                    • 💬 ${Number(agent.total_mentions).toLocaleString()} Mentions
                </span>`

            extraHTML = `
                <div class="super-groups-list" style="color:#1DA1F2;">
                    Agent on : 
                    <i class="fa-brands fa-x-twitter"></i>
                </div>`
        }

        html += `
        <div class="super-card" onclick="window.location.href='${profileLink}'">
            <img src="${agent.profile_image || 'assets/default-agent.png'}" 
                 class="super-avatar"
                 onerror="this.src='assets/default-agent.png'">

            <div class="super-info">
                <div class="super-name">
                    ${agent.agent_name}
                    ${verified}
                </div>
                <div class="super-username">@${agent.username || 'no-username'}</div>
                
                <div class="super-stats">
                    ${statsHTML}
                </div>
                
                ${extraHTML}
            </div>
        </div>`
    })

    container.innerHTML = html || `<p style="grid-column: 1 / -1; text-align:center; padding:40px 20px;">NO SUPER AGENT FOUND</p>`
}

/* =========================
SEARCH FILTER
========================= */
function filterSuperAgents(){
    const keyword = document.getElementById("searchSuper").value.toLowerCase()
    const filtered = allSuperAgents.filter(agent => 
        (agent.agent_name && agent.agent_name.toLowerCase().includes(keyword)) ||
        (agent.username && agent.username.toLowerCase().includes(keyword))
    )
    renderSuperAgents(filtered)
}

/* =========================
INIT
========================= */
document.addEventListener("DOMContentLoaded", function(){
    loadSuperAgents()
    setInterval(loadSuperAgents, 180000) // update setiap 3 menit
})