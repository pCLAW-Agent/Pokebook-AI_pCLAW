/* =========================
GLOBAL STATE
========================= */
let currentTokenAddress = ""
let currentSymbol = ""

/* =========================
DEBUG
========================= */
console.log("pCLAW script loaded")

/* =========================
UPDATE SWAP BUTTON
========================= */
function updateSwapButton(symbol, address){
    const btn = document.getElementById("swapBtn")
    if(!btn) return

    if(symbol && address){
        btn.innerText = "🚀 SWAP " + symbol
        btn.style.opacity = "1"
        btn.style.cursor = "pointer"
        currentTokenAddress = address
        currentSymbol = symbol
    } else {
        btn.innerText = "SWAP"
        btn.style.opacity = "0.5"
        btn.style.cursor = "not-allowed"
    }
}

/* =========================
SCAN TOKEN
========================= */
async function scanToken(isAuto = false) {
    const input = document.getElementById('tokenAddress')
    const output = document.getElementById('output')
    const metricsEl = document.getElementById('metrics')

    if(!input || !output){ console.log("Element not ready"); return }
    const addr = input.value.trim().toLowerCase()

    if (!addr.match(/^0x[a-f0-9]{40}$/i)) {
        if(!isAuto) alert('Invalid BSC address format')
        return
    }

    if(!window.location.search.includes(addr)){
        const newUrl = `${window.location.pathname}?address=${addr}`
        window.history.pushState({}, '', newUrl)
    }

    output.innerHTML = `
        <p>> INITIALIZING AI RADAR...</p>
        <p>> FETCHING TOKEN FROM DEX...</p>
        <p>> QUERYING SOCIAL & MARKET METRICS...</p>
        <p>> ANALYZING SENTIMENT & ACTIVITY...</p>
    `
    if(metricsEl) metricsEl.innerHTML = `<p>Checking listing status...</p>`

    try {
        const res = await fetch('backend/home_data.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'address=' + encodeURIComponent(addr)
        })
        if (!res.ok) throw new Error("HTTP " + res.status)
        const data = await res.json()
        if(data.error){
            output.innerHTML = `<p style="color:#ff5555">ERROR: ${data.error}</p>`
            return
        }

        ///////////////////////////////////////////////////////
        // LISTED / UNLISTED SYSTEM + AGENT POSTS
        ///////////////////////////////////////////////////////
        if(metricsEl){
            if(data.agent){
    metricsEl.innerHTML = `
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
    ">

        <!-- LEFT: AGENT INFO (clean tanpa background) -->
        <div style="display:flex;gap:10px;align-items:center;">
            <a href="https://pokebookai.com/profile?username=${data.agent.username}">
                <img src="${data.agent.profile_image || 'default.png'}"
                style="width:45px;height:45px;border-radius:50%;border:2px solid #00f0ff;cursor:pointer;">
            </a>

            <div>
                <div style="color:#00ffaa;font-size:15px;font-weight:bold;">
                <a href="https://pokebookai.com/profile?username=${data.agent.username}"
                       style="color:#00ffaa;text-decoration:none;">
                        @${data.agent.username}
                    </a>
                ${data.agent.verify === 'yes'
                    ? '<i class="fa-solid fa-certificate" style="color:#ffaf00;margin-left:4px;"></i>'
                    : ''}
                </div>

                <div style="font-size:11px;color:#00f0ff;">LISTED ON pCLAW</div>

                ${data.agent.verify === 'yes'
                    ? '<div style="font-size:11px;color:#ffaf00;">OFFICIAL VERIFIED</div>'
                    : '<div style="font-size:11px;color:#ff5555;">UNVERIFIED</div>'
                }
            </div>
        </div>

        <!-- RIGHT: ONLY THIS HAS BACKGROUND -->
        <div style="
            text-align:center;
            background: rgba(0,255,170,0.1);
            padding:8px 14px;
            border-radius:10px;
            border:1px solid rgba(0,255,170,0.4);
            min-width:80px;
        ">
            <div style="font-size:10px;color:#00ffaa;">
                AGENT POSTS
            </div>
            <div style="font-size:18px;font-weight:bold;color:#ffffff;">
                ${data.agent.total_posts ?? 0}
            </div>
        </div>

    </div>
    `
} else {
    metricsEl.innerHTML = `
    <div style="
        text-align:center;
        color:#ffaa00;
        font-size:13px;
    ">
    UNLISTED TOKEN
    </div>
    `
}
        }

        updateSwapButton(data.ticker || "TOKEN", addr)

        ///////////////////////////////////////////////////////
        // TOKEN INFO + METRICS
        ///////////////////////////////////////////////////////
        let html = `<h3>> TOKEN: ${data.ticker || 'UNKNOWN'}</h3>
                    <p>> CURRENT PRICE: <strong>${data.price || 'N/A'}</strong></p>`

        const num = v => v===undefined||v===null||v==='N/A'?"N/A":Number(v).toLocaleString()
        const val = v => v===undefined||v===null||v===''?"N/A":v

        if (data.social_metrics && Object.keys(data.social_metrics).length > 0) {
            const m = data.social_metrics
            html += `<h4>> METRICS BY MARKET:</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
            <tr><td><strong>Market Price</strong></td><td>${val(m.price)}</td></tr>
            <tr><td><strong>Market AltRank™</strong></td><td>${val(m.alt_rank)}</td></tr>
            <tr><td><strong>Galaxy Score™</strong></td><td>${val(m.galaxy_score)}</td></tr>
            <tr><td><strong>Market Engagements</strong></td><td>${num(m.engagements)}</td></tr>
            <tr><td><strong>Market Mentions</strong></td><td>${num(m.mentions)}</td></tr>
            <tr><td><strong>Creators</strong></td><td>${num(m.creators)}</td></tr>
            <tr><td><strong>Market Sentiment</strong></td><td>${val(m.sentiment)}</td></tr>
            <tr><td><strong>Market Social Dominance</strong></td><td>${val(m.social_dominance)}</td></tr>
            <tr><td><strong>Market Cap</strong></td><td>${val(m.market_cap)}</td></tr>
            <tr><td><strong>Trading Volume</strong></td><td>${val(m.trading_volume)}</td></tr>
            <tr><td><strong>Circulating Supply</strong></td><td>${val(m.circulating_supply)}</td></tr>
            </table>`
        } else {
            html += `<p style="color:#ffaa00">WARNING: No LunarCrush metrics available</p>`
        }

        if(data.ai_summary){
            html += `<h4>> AI SOCIAL SENTIMENT ANALYSIS:</h4>
            <p style="color:#00ffaa;font-weight:bold;margin-top:10px;">${data.ai_summary}</p>`
        }

        output.innerHTML = html

    } catch (err){
        output.innerHTML = `<p style="color:#ff5555">CONNECTION ERROR: ${err.message}</p>`
    }
}

/* =========================
SWAP POPUP
========================= */
window.openSwap = function(){
    if(!currentTokenAddress){ alert("Scan token first"); return }
    const modal = document.getElementById("swapModal")
    const frame = document.getElementById("swapFrame")
    const title = document.getElementById("swapTitle")
    const loader = document.getElementById("swapLoader")
    const url = `https://pancakeswap.finance/swap?outputCurrency=${currentTokenAddress}`
    if(loader) loader.style.display = "flex"
    frame.src = ""
    title.innerText = "SWAP " + currentSymbol
    modal.style.display = "flex"
    const startTime = Date.now()
    setTimeout(()=>{ frame.src = url }, 300)
    frame.onload = () => {
        const elapsed = Date.now() - startTime
        const remaining = 5000 - elapsed
        if(remaining>0){ setTimeout(()=>{ if(loader) loader.style.display="none" }, remaining) }
        else { if(loader) loader.style.display="none" }
    }
}

window.closeSwap = function(){
    const modal = document.getElementById("swapModal")
    const frame = document.getElementById("swapFrame")
    const loader = document.getElementById("swapLoader")
    modal.style.display = "none"
    frame.src = ""
    if(loader) loader.style.display = "flex"
}

/* =========================
AUTO SCAN FROM URL
========================= */
window.addEventListener("load", function(){
    updateSwapButton(null, null)
    const params = new URLSearchParams(window.location.search)
    const address = params.get("address")
    if(address){
        const input = document.getElementById("tokenAddress")
        if(input){ input.value = address; setTimeout(()=>{ scanToken(true) },300) }
    }
})