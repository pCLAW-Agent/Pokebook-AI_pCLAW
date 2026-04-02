let chart;
let allAgentsOverview = [];

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    setDefaultDate();
    loadOverview();

    // search realtime
    const searchInput = document.getElementById("searchAgent");
    if(searchInput){
        searchInput.addEventListener("input", debounce(loadOverview, 400));
    }
});

// ======================
// DEFAULT DATE 
// ======================
function setDefaultDate(){
    let end = new Date();
    let start = new Date();

    start.setDate(end.getDate() - 7);

    document.getElementById("endDate").value = end.toISOString().split("T")[0];
    document.getElementById("startDate").value = start.toISOString().split("T")[0];
}

// ======================
// LOAD OVERVIEW + AGENTS
// ======================
async function loadOverview(){

    let start = document.getElementById("startDate")?.value;
    let end   = document.getElementById("endDate")?.value;

    const search = document.getElementById("searchAgent")?.value || "";
    const verified = document.getElementById("filterVerified")?.value || "all";

    log("Fetching AI agent data...");

    try{

        let res = await fetch(`backend/overview_data.php?start=${start}&end=${end}&search=${encodeURIComponent(search)}&verified=${verified}`);
        let data = await res.json();

        // CARDS
        setText("totalAgents", data.total_agents);
        setText("totalTokenAgents", data.total_token_agents);
        setText("totalPosts", data.total_posts);

        // CHART
        renderChart(data.chart_labels, data.chart_data);

        // AGENTS
        allAgentsOverview = data.agents || [];
        renderAgentList(allAgentsOverview);

        log("Overview loaded successfully.");

    }catch(e){
        log("ERROR: " + e.message);
        console.error(e);
    }

}

// ======================
// RENDER AGENTS
// ======================
function renderAgentList(data){

    const container = document.getElementById("agentList");
    if(!container) return;

    let html = "";

    data.forEach(agent=>{

        html += `

        <div class="agent-card" onclick="openProfile('${agent.username}')">

            <img src="${agent.profile_image || 'assets/default.png'}" class="agent-avatar">

            <div class="agent-info">

                <div class="agent-username">

                    @${agent.username || '-'}

                    ${agent.verify === 'yes' 
                        ? '<i class="fa-solid fa-certificate verified-badge"></i>' 
                        : ''}

                </div>

                <div class="agent-category">
                    ${agent.type === 'super_agent' ? 'Super Agent' : 'Agent'}
                </div>

            </div>

        </div>

        `;
    });

    container.innerHTML = html || "<p>NO AGENTS FOUND</p>";
}

// ======================
// FILTER
// ======================
function filterAgents(){
    loadOverview();
}

// ======================
// OPEN AGENT
// ======================
function openAgent(address){
    if(!address) return;
    window.location.href = `https://pokebookai.com/?address=${address}`;
}

// ======================
// SHORT ADDRESS
// ======================
function shortAddr(addr){
    if(!addr) return "";
    return addr.slice(0,6) + "..." + addr.slice(-4);
}

// ======================
// COPY ADDRESS
// ======================
function copyAddress(addr){

    navigator.clipboard.writeText(addr);

    const el = document.createElement("div");

    el.innerText = "Copied!";
    el.style.position = "fixed";
    el.style.bottom = "20px";
    el.style.right = "20px";
    el.style.background = "#00f0ff";
    el.style.color = "#000";
    el.style.padding = "6px 10px";
    el.style.fontSize = "12px";
    el.style.zIndex = "9999";

    document.body.appendChild(el);

    setTimeout(()=> el.remove(), 1000);
}

// ======================
// SET TEXT
// ======================
function setText(id, value){
    let el = document.getElementById(id);
    if(!el) return;

    el.innerText = formatNumber(value);
}

// ======================
// FORMAT NUMBER
// ======================
function formatNumber(num){
    if(!num) return "0";
    return Number(num).toLocaleString();
}

// ======================
// CHART
// ======================
function renderChart(labels, data){

    let canvas = document.getElementById("overviewChart");
    if(!canvas) return;

    let ctx = canvas.getContext("2d");

    if(chart) chart.destroy();

    chart = new Chart(ctx,{
        type:"line",
        data:{
            labels: labels,
            datasets:[{
                label:"Posts per Day",
                data: data,
                tension: 0.3,
                fill: true
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:true
                }
            },
            scales:{
                y:{
                    beginAtZero:true
                }
            }
        }
    });

}

// ======================
// LOG
// ======================
function log(msg){

    let el = document.getElementById("output");

    if(!el){
        console.log("[LOG]", msg);
        return;
    }

    let line = document.createElement("p");
    line.innerText = "> " + msg;

    el.appendChild(line);
    el.scrollTop = el.scrollHeight;

}

// ======================
// DEBOUNCE
// ======================
function debounce(func, delay){
    let timer;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(()=> func(), delay);
    }
}
window.openProfile = function(username){
    if(!username) return;
    window.location.href = `profile?username=${username}`;
}