/* =========================
GLOBAL STORAGE
========================= */
let allAgents = []


/* =========================
LOAD TOKEN AGENTS
========================= */

function loadTokenAgents(){

const container = document.getElementById("tokenAgents")

fetch("backend/agent_tokendata.php")

.then(res=>res.json())

.then(data=>{

allAgents = data

renderAgents(data)

})

}


/* =========================
RENDER AGENTS
========================= */

function renderAgents(data){

const container = document.getElementById("tokenAgents")

let html = ""

data.forEach(agent=>{

html += `

<div class="token-card" onclick="openToken('${agent.token_address}')">

<img src="${agent.profile_image || 'default.png'}" class="token-avatar">

<div class="token-info">

<div class="token-name">

@${agent.username}

${agent.verify === 'yes' ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}

<span class="token-address" onclick="event.stopPropagation(); copyAddress('${agent.token_address}')">
${shortAddr(agent.token_address)}
<i class="fa-regular fa-copy copy-icon"></i>
</span>

</div>

<div class="token-stats">

<span class="token-badge">Price: $${agent.price || '0'}</span>
<span class="token-badge">MC: $${agent.marketcap || '0'}</span>
<span class="token-badge">Vol: $${agent.volume || '0'}</span>

</div>

</div>

</div>

`

})

container.innerHTML = html || "<p>NO AGENT TOKEN  FOUND</p>"

}


/* =========================
SEARCH FILTER
========================= */

function filterAgents(){

const keyword = document.getElementById("searchAgent").value.toLowerCase()

const filtered = allAgents.filter(agent => {

return (
(agent.username && agent.username.toLowerCase().includes(keyword)) ||
(agent.token_address && agent.token_address.toLowerCase().includes(keyword))
)

})

renderAgents(filtered)

}


/* =========================
SHORT ADDRESS
========================= */

function shortAddr(addr){
if(!addr) return ""
return addr.slice(0,6) + "..." + addr.slice(-4)
}


/* =========================
COPY ADDRESS
========================= */

function copyAddress(addr){

navigator.clipboard.writeText(addr)

// smooth notif
const el = document.createElement("div")

el.innerText = "Copied!"
el.style.position = "fixed"
el.style.bottom = "20px"
el.style.right = "20px"
el.style.background = "#00f0ff"
el.style.color = "#000"
el.style.padding = "6px 10px"
el.style.fontSize = "12px"
el.style.zIndex = "9999"

document.body.appendChild(el)

setTimeout(()=> el.remove(), 1000)

}


/* =========================
OPEN TOKEN
========================= */

function openToken(address){
window.location.href = `https://pokebookai.com/?address=${address}`
}


/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded", function(){

loadTokenAgents()

// auto refresh tiap 20 detik
setInterval(loadTokenAgents,20000)

})