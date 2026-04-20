let currentTokenAddress = "";
let currentSymbol = "";
let currentFromToken = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
let currentFromSymbol = "BNB";
// Global variables
let currentPredictionData = null;

const KNOWN_PAIRS = {
    "BNB":  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "WBNB": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    "USDT": "0x55d398326f99059ff775485246999027b3197955",
    "USDC": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    "BUSD": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    "USD1": "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d",
    "ASTER": "0x000Ae314E2A2172a039B26378814C252734f556A"
};

function normalizeToken(addr) {
    if (!addr) return "";
    const lower = addr.toLowerCase();
    if (lower === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        return "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
    }
    return lower;
}

/* =========================
MOBILE TAB SYSTEM - FIXED VERSION
========================= */

function initMobileFooterTabs() {
    const footer = document.getElementById('mobileFooterTabs');
    if (!footer) return;

    const tabs = footer.querySelectorAll('.tab-item');
    const tokenMarketSec = document.getElementById('tokenMarketSection');
    const swapSec = document.getElementById('swapSection');
    const swapBox = document.getElementById('inlineSwapBox');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {

           
            tabs.forEach(t => t.classList.remove('tab-active'));
            if (tokenMarketSec) tokenMarketSec.classList.remove('tab-active');
            if (swapSec) swapSec.classList.remove('tab-active');

            
            tab.classList.add('tab-active');

            const target = tab.getAttribute('data-tab');

            if (target === 'token-market') {
                if (tokenMarketSec) tokenMarketSec.classList.add('tab-active');

                
                if (swapBox) swapBox.style.display = "none";

            } else if (target === 'swap') {
                if (swapSec) swapSec.classList.add('tab-active');

                
                if (swapBox) swapBox.style.display = "block";
            }
        });
    });
}
/* =========================
LOAD TECHNICAL ANALYSIS - 
========================= */
async function loadTechnicalAnalysis(contractAddress) {
    if (!contractAddress) return;

    let section = document.getElementById('technicalAnalysisSection');
    if (section) section.remove();

    section = document.createElement('div');
    section.id = 'technicalAnalysisSection';

    section.innerHTML = `
        <h4 style="color:#00c4ff; margin:18px 0 12px 0; font-size:14.5px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-chart-line"></i> 
            AI ANALYSIS
        </h4>

        <div id="techContent" style="background:#4caf5008; border-radius:14px; padding:14px; border:1px solid #1e2937;">
            <div style="text-align:center; padding:50px 20px; color:#64748b;">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>
                Analyzing market structure...
            </div>
        </div>

        <style>
            .tech-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 14px;
            }
            @media (max-width: 768px) {
                .tech-grid { grid-template-columns: 1fr; gap: 14px; }
            }

            .overall-insight {
                background: #00962e0f;
                border-radius: 12px;
                padding: 11px 16px;
                margin-bottom: 14px;
                text-align: center;
                grid-column: 1 / -1;
            }

            .insight-bias {
                font-size: 17px;
                font-weight: 700;
                padding: 7px 22px;
                border-radius: 9999px;
                display: inline-block;
            }

            .cross-matrix {
    border-radius: 12px;
    padding: 13px;
    overflow-x: auto;
    overflow-y: hidden;

    /* smooth scroll */
    scroll-behavior: smooth;

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,0.3) transparent;
}

/* =========================
   SCROLLBAR (CHROME / EDGE)
========================= */
.cross-matrix::-webkit-scrollbar {
    height: 5px;
}

.cross-matrix::-webkit-scrollbar-track {
    background: transparent;
}

.cross-matrix::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.25);
    border-radius: 999px;
    transition: all 0.2s ease;
}

/* hover biar sedikit muncul */
.cross-matrix:hover::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.5);
}

/* optional: efek glow dikit */
.cross-matrix::-webkit-scrollbar-thumb:hover {
    background: rgba(148,163,184,0.7);
}

            .matrix-header {
                display: grid;
                grid-template-columns: 125px repeat(4, 1fr);
                gap: 6px;
                margin-bottom: 9px;
                font-size: 12px;
                color: #94a3b8;
                text-align: center;
                min-width: 420px;
            }

            .matrix-row {
                display: grid;
                grid-template-columns: 125px repeat(4, 1fr);
                gap: 6px;
                align-items: center;
                margin-bottom: 6px;
                min-width: 420px;
            }

            .indicator-name {
                font-size: 13px;
                color: #e2e8f0;
                font-weight: 500;
            }

            .signal-box {
                font-weight: 700;
                font-size: 12.8px;
                padding: 6px 10px;
                border-radius: 6px;
                text-align: center;
                white-space: nowrap;
                background: rgba(0, 0, 0, 0.5);
                color: #ffffff;
            }

            /* ACTIVE CROSSES - PROGRESS BAR LEBIH PANJANG */
            .active-crosses {
                background: #4caf500d;
                border-radius: 12px;
                padding: 13px;
                overflow-y:auto;
            }

            .active-item {
                    display: grid;
                    grid-template-columns: 73px 150px 41px 1fr;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    background: #01020136;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border: solid 1px #82b027ab;
            }

            @media (max-width: 768px) {
                .active-item {
                            grid-template-columns: 73px 112px 41px 65px;
                            gap: 1px;
                }
            }

            .progress-bar {
                height: 8px;
                background: #334155;
                border-radius: 9999px;
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10.5px;
                font-weight: 700;
                color: #000000;
            }
        </style>
    `;

    const output = document.getElementById('output');
    if (output) {
        const predSection = document.getElementById('aiPredictionSection');
        if (predSection) {
            predSection.parentNode.insertBefore(section, predSection);
        } else {
            output.appendChild(section);
        }
    }

    try {
        const res = await fetch(`/backend/ai_analyze.php?contract=${encodeURIComponent(contractAddress)}`);
        const data = await res.json();

        if (!data.success) {
            document.getElementById('techContent').innerHTML = `
                <div style="color:#ff5555; text-align:center; padding:45px;">
                    Failed to load technical analysis
                </div>`;
            return;
        }

        const cm = data.crossMatrix || {};
        const ac = data.activeCrosses || [];
        const overallBias = data.overallBias || "NEUTRAL";

        let biasColor = overallBias === "BULLISH" ? "#22c55e" : (overallBias === "BEARISH" ? "#ef4444" : "#eab308");
        let biasText = overallBias === "BULLISH" ? "BULLISH" : (overallBias === "BEARISH" ? "BEARISH" : "NEUTRAL");

        let html = `
            <div class="overall-insight">
                <div style="color:#94a3b8; font-size:13px; margin-bottom:8px;">OVERALL MARKET BIAS</div>
                <div class="insight-bias" style="background:${biasColor}25; color:${biasColor};">
                    ${biasText} BIAS
                </div>
            </div>

            <div class="tech-grid">
                <!-- Cross Matrix tetap dengan panah saja -->
                <div class="cross-matrix">
                    <div class="matrix-header">
                        <div></div>
                        <div>30m</div>
                        <div>1h</div>
                        <div>4h</div>
                        <div>1d</div>
                    </div>`;

        const indicators = [
            {key: "MA50_200", name: "MA 50 × 200"},
            {key: "EMA9_21",  name: "EMA 9 × 21"},
            {key: "MACD",     name: "MACD"},
            {key: "RSI",      name: "RSI"},
            {key: "Bollinger",name: "Bollinger"},
            {key: "Volume",   name: "Volume"}
        ];

        indicators.forEach(ind => {
            html += `<div class="matrix-row">
                <div class="indicator-name">${ind.name}</div>`;

            ['30min','1h','4h','1d'].forEach(tf => {
                const val = cm[ind.key] || {percent: 50, signal: "NEUTRAL"};

                let arrow = "—";
                let textColor = "#ffffff";

                if (val.signal === "BULL") {
                    arrow = "↑";
                    textColor = "#4ade80";
                } else if (val.signal === "BEAR") {
                    arrow = "↓";
                    textColor = "#f87171";
                }

                html += `
                    <div class="signal-box" style="color:${textColor};">
                        ${arrow} ${val.percent}%
                    </div>`;
            });

            html += `</div>`;
        });

        html += `</div>`;

        // ACTIVE CROSSES -
        html += `<div class="active-crosses">
            <div style="color:#00c4ff; font-size:13.5px; margin-bottom:12px; font-weight:600;">
                ACTIVE CROSSES • Ranked by reliability
            </div>`;

        ac.forEach(item => {
            let progressColor = "#94a3b8";
            let arrow = "—";

            if (item.signal.includes("BULL")) {
                progressColor = "#4ade80";
                arrow = "↑";
            } else if (item.signal.includes("BEAR")) {
                progressColor = "#f87171";
                arrow = "↓";
            }

            html += `
                <div class="active-item">
                    <div style="font-weight:600;">${item.indicator}</div>
                    <div style="flex:1; padding:0 12px;">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.percent}%; background:${progressColor};">
                                ${item.percent}%
                            </div>
                        </div>
                    </div>
                    <div style="color:#94a3b8; text-align:center;">${item.timeframe}</div>
                    
                    

                    <div style="font-size:16px; color:${progressColor};">${arrow}</div>
                </div>`;
        });

        html += `</div></div>`;

        document.getElementById('techContent').innerHTML = html;

    } catch (err) {
        console.error("Technical Analysis Error:", err);
        document.getElementById('techContent').innerHTML = `
            <div style="color:#ff5555; text-align:center; padding:45px;">
                Failed to load technical analysis
            </div>`;
    }
}
/* =========================
LOAD TOP SEARCH TOKENS - CUSTOM STYLE
========================= */
async function loadTopSearch() {
    const container = document.getElementById('topSearchMarquee');
    if (!container) return;

    container.innerHTML = `<div class="top-search-marquee" id="marqueeInner"></div>`;

    try {
        const res = await fetch('/backend/top_search.php');
        const data = await res.json();

        if (!data.success || !data.tokens || data.tokens.length === 0) {
            container.innerHTML = `<div style="color:#64748b; text-align:center; padding:25px 0;">No trending tokens right now</div>`;
            return;
        }

        let html = '';
        const tokensList = [...data.tokens, ...data.tokens];   // untuk infinite loop

        tokensList.forEach(token => {
            const proxyUrl = `/backend/image_proxy.php?path=${encodeURIComponent(token.icon)}`;
            
            html += `
                <div class="top-search-item" onclick="quickScan('${token.contractAddress}', '${token.symbol}')">
                    <img src="${proxyUrl}" alt="${token.symbol}" 
                         onerror="this.src='https://via.placeholder.com/26/1e2937/94a3b8?text=${token.symbol[0]}'">
                    <span>${token.symbol}</span>
                </div>`;
        });

        document.getElementById('marqueeInner').innerHTML = html;

    } catch (e) {
        console.error("Top Search Error:", e);
        container.innerHTML = `<div style="color:#ff5555; text-align:center; padding:25px 0;">Failed to load top tokens</div>`;
    }
}

// Quick Scan
function quickScan(address, symbol) {
    const input = document.getElementById('tokenAddress');
    if (input) {
        input.value = address;
        scanToken();
    }
}

// Load otomatis
window.addEventListener('load', loadTopSearch);

/* =========================
UPDATE SWAP UI
========================= */
function updateSwapUI(symbol, address, preferredPair = "BNB", preferredFromToken = null) {
    currentTokenAddress = address || "";
    currentSymbol = symbol || "";
    currentFromSymbol = preferredPair || "BNB";
    currentFromToken = preferredFromToken || KNOWN_PAIRS[preferredPair] || KNOWN_PAIRS["BNB"];

    const fromSymbolEl = document.getElementById("fromSymbol");
    const toSymbolEl   = document.getElementById("toSymbol");
    const swapBox      = document.getElementById("inlineSwapBox");

    if (fromSymbolEl) fromSymbolEl.textContent = currentFromSymbol;
    if (toSymbolEl)   toSymbolEl.textContent   = currentSymbol || "TOKEN";
    if (swapBox)      swapBox.style.display    = "block";

    updateWalletUIState();
}

/* =========================
WALLET & BUTTON STATE
========================= */
function updateWalletUIState() {
    const isConnected = !!window.walletAddress;
    const amount = parseFloat(document.getElementById("swapAmount")?.value || 0);
    const hasToken = !!currentTokenAddress;

    const executeBtn = document.getElementById("executeSwapBtn");

    if (executeBtn) {
        executeBtn.style.display = "block";
        const canSwap = isConnected && amount > 0 && hasToken;
        executeBtn.disabled = !canSwap;
        executeBtn.style.opacity = canSwap ? "1" : "0.6";
        executeBtn.style.cursor = canSwap ? "pointer" : "not-allowed";
    }
}
/* =========================
LOAD AI PREDICTION
========================= */
async function loadAIPrediction(contractAddress) {
    if (!contractAddress) return;

    let predSection = document.getElementById('aiPredictionSection');
    if (predSection) predSection.remove();

    predSection = document.createElement('div');
    predSection.id = 'aiPredictionSection';
    predSection.className = 'prediction-card';

    predSection.innerHTML = `
        <h4 class="prediction-title">
            <i class="fa-solid fa-crystal-ball"></i> 
            24H PREDICTION MARKET
        </h4>

        <div id="predictionContent">
            <div class="prediction-locked">
                <div class="lock-icon">🔒</div>
                <p>Unlock AI Prediction</p>
                <button onclick="showPredictionFeePopup('${contractAddress}')" class="generate-btn">
                    Generate Prediction 
                </button>
            </div>
        </div>
    `;

    // Append ke output (akan dipindah manual di scanToken)
    const output = document.getElementById('output');
    if (output) output.appendChild(predSection);
}
async function fetchAndRenderPrediction(contractAddress) {
    const content = document.getElementById('predictionContent');
    if (!content) return;

    content.innerHTML = `
        <div class="prediction-loading">
            <i class="fa-solid fa-spinner fa-spin fa-lg"></i><br><br>
            Generating AI prediction...
        </div>
    `;

    try {
        const res = await fetch(`/backend/ai_prediction.php?address=${encodeURIComponent(contractAddress)}`);
        const data = await res.json();

        if (!data.success) {
            content.innerHTML = `<div class="prediction-error">${data.message || 'Failed to load prediction'}</div>`;
            return;
        }

        const p = data.prediction;

        // 
        const storageKey = `prediction_expiry_${contractAddress.toLowerCase()}`;
        
        let expiryTime = localStorage.getItem(storageKey);

        if (!expiryTime || parseInt(expiryTime) < Date.now() / 1000) {
            expiryTime = p.expiryTime;
            localStorage.setItem(storageKey, expiryTime);
        } else {
            p.expiryTime = parseInt(expiryTime);
        }

        window.predictionExpiryTime = parseInt(p.expiryTime);
        window.currentPredictionAddress = contractAddress.toLowerCase();

        //
        renderPredictionCard(p);

        startLiveCountdown();

    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="prediction-error">Failed to load AI prediction</div>`;
    }
}
function showPredictionFeePopup(contractAddress) {
    const modal = document.createElement('div');

    modal.innerHTML = `
    <div class="prot-popup-overlay">
        <div class="prot-popup-box">

            <div class="prot-popup-title">
                ⚡ Generate AI Prediction
            </div>

            <div style="margin:15px 0; font-size:14px; color:#cbd5f5;">
                Fees <strong>0.005 BNB</strong> will be automatically sent 
                to CZ Binance wallet as a donation for 
                <strong>FREEDOM OF MONEY Book by CZ</strong>.
            </div>
            <div style="display:flex; justify-content:center; margin-top:10px;">
                <img 
                    src="https://m.media-amazon.com/images/I/813Nz5KRfaL._UF1000,1000_QL80_.jpg" 
                    alt="Freedom of Money Book"
                    style="
                        width:140px;
                        border-radius:12px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                        border:1px solid rgba(255,255,255,0.1);
                    "
                >
            </div>

            <div class="prot-actions">
                <button id="cancelFee" class="prot-btn prot-cancel">
                    Cancel
                </button>
                <button id="confirmFee" class="prot-btn prot-save">
                    Continue
                </button>
            </div>

        </div>
    </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelFee').onclick = () => modal.remove();

    modal.querySelector('#confirmFee').onclick = () => {
        modal.remove();
        unlockPrediction(contractAddress); 
    };
}
async function unlockPrediction(contractAddress) {
    if (!window.walletAddress) {
        showCenterPopup("Connect wallet first!");
        return;
    }

    const CZ_ADDRESS = "0x28C6c06298d514Db089934071355E5743bf21d60"; 

    const btn = document.querySelector('.generate-btn');
    if (btn) {
        btn.innerHTML = "⏳ Opening wallet...";
        btn.disabled = true;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        updatePredictionStatus("⏳ Please confirm sending 0.005 BNB in your wallet...");

        const tx = await signer.sendTransaction({
            to: CZ_ADDRESS,
            value: ethers.utils.parseEther("0.005")
        });

       
        updatePredictionStatus("✅ Transaction sent! Waiting for confirmation on BSC...");

        await tx.wait(); 

        updatePredictionStatus("🎉 Payment confirmed - Unlocking AI Prediction");

        await fetchAndRenderPrediction(contractAddress);

    } catch (err) {
        console.error("Payment Error:", err);

        let errorMsg = "❌ Payment failed";

        if (err.code === 4001 || 
            err.message?.toLowerCase().includes("rejected") || 
            err.message?.toLowerCase().includes("user denied") ||
            err.message?.toLowerCase().includes("cancel")) {
            
            errorMsg = "❌ Transaction was cancelled";
        } 
        else if (err.code === -32603 || err.message?.includes("insufficient funds")) {
            errorMsg = "❌ Insufficient BNB balance";
        }

        updatePredictionStatus(errorMsg);

        // Reset tombol
        if (btn) {
            btn.innerHTML = "⚡ Generate Prediction (0.005 BNB)";
            btn.disabled = false;
        }
    }
}
function updatePredictionStatus(text) {
    const content = document.getElementById('predictionContent');
    if (content) {
        content.innerHTML = `<div style="text-align:center; padding:30px;">${text}</div>`;
    }
}

function renderPredictionCard(p) {
    const content = document.getElementById('predictionContent');
    if (!content) return;

    // === Save DATA PREDICTION to GLOBAL VARIABLE ===
    currentPredictionData = p;

    const moveClass = parseFloat(p.predictedMove || 0) >= 0 ? 'bullish' : 'bearish';

    const html = `
        <div class="prediction-levels">
            <div class="level-item">
                <div class="level-label">BASE PRICE</div>
                <div class="level-value">$${p.basePrice || '0.00000000'}</div>
            </div>
            <div class="level-item">
                <div class="level-label">PREDICTED TARGET</div>
                <div class="level-value ${moveClass}">
                    $${p.predictedPrice || '0.00000000'} 
                    <span>(${p.predictedMove || '0.00%'})</span>
                </div>
            </div>
        </div>

        <div class="prediction-main">
            <div class="prediction-direction ${p.direction ? p.direction.toLowerCase() : 'neutral'}">
                ${p.direction || 'Neutral'} • ${p.priceChange || '0.00%'}
            </div>
            <div class="prediction-summary">
                ${p.summary || 'No summary available.'}
            </div>
            <div class="resolution-rule">
                <strong>Resolution Rule:</strong><br>
                ${p.resolutionRule || 'Target must be touched within 24 hours.'}
            </div>
        </div>

        <div class="prediction-status">
            <strong>Entry Indicator:</strong> 
            <span id="predictionStatus" class="status-running">
                RUNNING • <span id="countdownTimer">Calculating...</span>
            </span>
        </div>

        <div class="prediction-metrics">
            <div class="metric-item">
                <strong>24H Volume:</strong> 
                $${Number(p.volume24h || 0).toLocaleString('en-US')}
            </div>
            <div class="metric-item">
                <strong>Netflow:</strong> 
                <span class="${(p.netflow || 0) >= 0 ? 'positive' : 'negative'}">
                    $${Number(Math.abs(p.netflow || 0)).toLocaleString('en-US')} 
                    ${(p.netflow || 0) >= 0 ? '↑ Inflow' : '↓ Outflow'}
                </span>
            </div>
            <div class="metric-item">
                <strong>Smart Money:</strong> 
                ${p.smartMoneyHolders || 0} holders (${p.smartMoneyPercent || '0.000'}%)
            </div>
        </div>

        <button id="shareToXBtn" class="share-image-btn">
            📤 Share to X
        </button>
    `;

    content.innerHTML = html;

    // Attach event listener
    setTimeout(() => {
        const btn = document.getElementById('shareToXBtn');
        if (btn) {
            btn.addEventListener('click', sharePredictionToX);
        }
    }, 100);
}
/* ==================== LIVE COUNTDOWN ==================== */
function startLiveCountdown() {
    if (window.predictionCountdownInterval) {
        clearInterval(window.predictionCountdownInterval);
    }

    // Update every 30 seconds
    window.predictionCountdownInterval = setInterval(updateCountdown, 30000);

    // First update immediately
    updateCountdown();
}

function updateCountdown() {
    const statusEl = document.getElementById('predictionStatus');
    const timerEl = document.getElementById('countdownTimer');
    if (!statusEl || !timerEl || !window.predictionExpiryTime) return;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = Math.max(0, window.predictionExpiryTime - now);

    if (timeLeft <= 0) {
        statusEl.className = 'status-timeout';
        timerEl.textContent = 'TIMEOUT - Entry Closed';
        if (window.predictionCountdownInterval) clearInterval(window.predictionCountdownInterval);
        return;
    }

    const hoursLeft = Math.floor(timeLeft / 3600);
    const minutesLeft = Math.floor((timeLeft % 3600) / 60);

    timerEl.textContent = `${hoursLeft}h ${minutesLeft}m left`;
    statusEl.className = 'status-running';
}
async function sharePredictionToX() {
    if (!currentPredictionData) {
        alert("Prediction data not available. Please load prediction first.");
        return;
    }

    const p = currentPredictionData;
    const ticker = (currentSymbol || "TOKEN").toUpperCase();
    const contractAddress = currentTokenAddress || "";

    const btn = document.getElementById('shareToXBtn');
    if (btn) {
        btn.innerHTML = '⏳ Preparing...';
        btn.disabled = true;
    }

    showLoadingPopup();

    try {
        //  API
        let logoUrl = null;
        if (contractAddress) {
            try {
                const res = await fetch(`/backend/image_pre.php?contract=${encodeURIComponent(contractAddress)}&chainId=56`);
                const apiData = await res.json();

                if (apiData.success && apiData.data && apiData.data.icon) {
                    logoUrl = apiData.data.icon;
                    console.log("✅ Logo URL dari API:", logoUrl); // 
                } else {
                    console.log("⚠️ API Failed");
                }
            } catch (e) {
                console.error("❌ Error fetch image_pre.php:", e);
            }
        }

        // make Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext('2d');

        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = "https://pokebookai.com/assets/prediction-bg.png";

        await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
        });

        ctx.drawImage(bgImg, 0, 0, 1200, 675);

        // Logo Section
        const logoX = 280;
        const logoY = 310;
        const logoRadius = 145;

        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 70;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Load Logo  API
        if (logoUrl) {
            console.log("🔄 Loading logo from:", logoUrl);
            const tokenLogo = new Image();
            tokenLogo.crossOrigin = "anonymous";
            tokenLogo.src = logoUrl;

            await new Promise((resolve) => {
                tokenLogo.onload = () => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(logoX, logoY, logoRadius - 15, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(tokenLogo, logoX - (logoRadius - 15), logoY - (logoRadius - 15), 
                                 (logoRadius - 15)*2, (logoRadius - 15)*2);
                    ctx.restore();
                    console.log("✅ Logo success ");
                    resolve();
                };

                tokenLogo.onerror = () => {
                    console.error("logo Failed ");
                    drawFallbackLogo(ctx, logoX, logoY);
                    resolve();
                };
            });
        } else {
            drawFallbackLogo(ctx, logoX, logoY);
        }

        // Teks 
        const textX = 520;

        ctx.fillStyle = '#86efac';
        ctx.font = '600 40px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('New Prediction', textX, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 92px Arial';
        ctx.fillText(ticker, textX, 250);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '500 30px Arial';
        ctx.fillText('Target Price :', textX, 310);

        const isPositive = parseFloat(p.predictedMove || 0) >= 0;
        ctx.fillStyle = isPositive ? '#4ade80' : '#f87171';
        ctx.font = 'bold 70px Arial';
        ctx.fillText('$' + (p.predictedPrice || '0.000000'), textX, 380);

        ctx.font = '600 34px Arial';
        ctx.fillText(p.predictedMove || '+0.00%', textX, 425);

        let statusText = 'RUNNING';
        let statusColor = '#fbbf24';
        if (p.currentStatus === 'Valid') {
            statusText = '✅ VALID';
            statusColor = '#4ade80';
        } else if (p.currentStatus === 'Timeout') {
            statusText = '⛔ TIMEOUT';
            statusColor = '#f87171';
        }

        ctx.fillStyle = statusColor;
        ctx.font = 'bold 40px Arial';
        ctx.fillText(statusText, textX, 490);

        ctx.fillStyle = 'white';
        ctx.font = '500 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('24H Agent Prediction • pCLAW', 600, 640);

        // Download 
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        const link = document.createElement('a');
        link.download = `${ticker}_Prediction.png`;
        link.href = URL.createObjectURL(blob);
        link.click();

        // open X
        const tweetText = `New Prediction for $${ticker}\n\nTarget Price: $${p.predictedPrice} ${p.predictedMove}\n${p.summary ? p.summary.substring(0,140)+'...' : ''}\n\nStatus: ${p.currentStatus || 'RUNNING'}\n#${ticker} #Crypto`;

        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');

    } catch (err) {
        console.error(err);
        alert("Failed share.");
    } finally {
        hideLoadingPopup();
        const btn = document.getElementById('shareToXBtn');
        if (btn) {
            btn.innerHTML = '📤 Share to X';
            btn.disabled = false;
        }
    }
}

// Helper Fallback
function drawFallbackLogo(ctx, x, y) {
    ctx.font = 'bold 135px Arial';
    ctx.fillStyle = '#1e2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', x, y + 5);
}

// ==================== POPUP LOADING ====================
function showLoadingPopup() {
    let popup = document.getElementById('predictionLoadingPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'predictionLoadingPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 23, 42, 0.95);
            color: white;
            padding: 25px 40px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 9999;
            text-align: center;
            font-size: 16px;
            border: 1px solid #334155;
        `;
        popup.innerHTML = `
            <div style="margin-bottom:12px;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; color:#22c55e;"></i>
            </div>
            <div>Preparing image for X...</div>
        `;
        document.body.appendChild(popup);
    }
    popup.style.display = 'block';
}

function hideLoadingPopup() {
    const popup = document.getElementById('predictionLoadingPopup');
    if (popup) popup.style.display = 'none';
}

// Helper function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}


// ==================== FORMAT ====================
function formatCompact(num) {
    num = Number(num);

    if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + 'K';

    return num.toFixed(2).replace(/\.00$/, '');
}


async function loadTopHolders(contractAddress) {
    if (!contractAddress) return;

    // Hapus section lama jika ada
    let holdersSection = document.getElementById('topHoldersSection');
    if (holdersSection) holdersSection.remove();

    holdersSection = document.createElement('div');
    holdersSection.id = 'topHoldersSection';
    holdersSection.className = 'top-holders-card';

    holdersSection.innerHTML = `
        <div class="top-holders-header">
            <div class="top-holders-title">
                <i class="fa-solid fa-users"></i>
                TOP 10 HOLDERS ANALYTICS
            </div>
        </div>

        <div id="topHoldersContent">
            <div style="text-align:center;padding:60px;color:#64748b">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>
                Loading holders distribution...
            </div>
        </div>
    `;

   
    const swapBox = document.getElementById('inlineSwapBox');
    if (swapBox) {
        swapBox.parentNode.insertBefore(holdersSection, swapBox.nextSibling); 
    } else {
       
        const output = document.getElementById('output');
        if (output) output.appendChild(holdersSection);
    }

    const contentEl = document.getElementById('topHoldersContent');

    try {
        const res = await fetch(`/backend/holders_data.php?contract=${encodeURIComponent(contractAddress)}`);
        const result = await res.json();

        if (!result.success || !result.data?.length) {
            contentEl.innerHTML = `<div style="color:#94a3b8;text-align:center;padding:50px">No holder data available</div>`;
            return;
        }

        const holders = result.data.slice(0, 10);
        let sumTop = 0;
        const pieData = [];

        holders.forEach((h, i) => {
            let percent = parseFloat(h.percent || 0);
            if (percent > 50) percent = 50;

            sumTop += percent;

            pieData.push({
                label: `Top ${i+1}`,
                value: percent,
                color: ["#00c4ff","#22c55e","#f59e0b","#ef4444","#a855f7","#06b6d4","#84cc16","#eab308","#f97316","#38bdf8"][i],
                wallet: h.wallet ? h.wallet.substring(0,8) + "..." + h.wallet.slice(-4) : ""
            });
        });

        const othersPercent = Math.max(0, 100 - parseFloat(sumTop.toFixed(2)));

        pieData.push({
            label: "Others",
            value: othersPercent,
            color: "#475569",
            wallet: ""
        });

        let gradientParts = [];
        let currentPercent = 0;

        pieData.forEach(p => {
            const start = currentPercent;
            const end = currentPercent + p.value;
            gradientParts.push(`${p.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
            currentPercent = end;
        });

        const gradient = gradientParts.join(', ');

        let html = `
        <div class="pie-wrapper">
            <div class="pie-container">
                <div class="pie-chart" style="background: conic-gradient(${gradient});"></div>
                <div class="pie-inner">
                    <div class="percent">${sumTop.toFixed(1)}%</div>
                    <div class="label">TOP 10</div>
                </div>
            </div>
        </div>

        <div class="pie-legend">`;

        pieData.forEach((p, i) => {
            html += `
                <div class="legend-item" data-index="${i}">
                    <div class="legend-color" style="background:${p.color}"></div>
                    <span>${p.label} — ${p.value.toFixed(2)}%</span>
                </div>`;
        });

        html += `</div>`;

        // Table
        html += `
        <div class="holder-table-header">
            <div>#</div>
            <div>Wallet</div>
            <div>Balance</div>
            <div>% Ownership</div>
            <div>Value</div>
        </div>

        <div class="top-holders-list">`;

        holders.forEach((holder, i) => {
            const shortWallet = holder.wallet 
                ? holder.wallet.slice(0, 6) + "..." + holder.wallet.slice(-4) 
                : "—";

            const balance = formatCompact(holder.balance || 0);
            const value = holder.valueUsd ? "$" + formatCompact(holder.valueUsd) : "—";
            const percentStr = parseFloat(holder.percent || 0).toFixed(2);

            const tokensHTML = holder.tokens?.length 
                ? holder.tokens.slice(0, 5).map(t => {
                    const proxyUrl = `/backend/image_proxy2.php?path=${encodeURIComponent(t.logo)}`;
                    return `
                        <div class="token-icon" title="${t.symbol || ''}">
                            <img src="${proxyUrl}" 
                                 onerror="this.src='https://via.placeholder.com/20/1e2937/94a3b8?text=?'">
                        </div>`;
                  }).join('')
                : `<span style="color:#64748b; font-size:11px;">—</span>`;

            html += `
            <div class="holder-row">
                <div class="holder-main">
                    <div class="col rank">#${i+1}</div>
                    <div class="col wallet">
                        <a href="https://bscscan.com/address/${holder.wallet}" target="_blank" class="wallet-link">
                            ${shortWallet}
                        </a>
                    </div>
                    <div class="col balance">${balance}</div>
                    <div class="col percent">${percentStr}%</div>
                    <div class="col value">${value}</div>
                </div>
                <div class="token-row">
                    ${tokensHTML}
                </div>
            </div>`;
        });

        html += `</div>`;
        contentEl.innerHTML = html;

        // Tooltip
        setTimeout(() => {
            const legendItems = document.querySelectorAll('.legend-item');
            legendItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(item.getAttribute('data-index'));
                    showSliceTooltip(pieData[index], e.clientX, e.clientY);
                });
            });
        }, 200);

    } catch (err) {
        console.error("Holders Error:", err);
        contentEl.innerHTML = `<div style="color:#ff5555;text-align:center;padding:50px">Failed to load holders data</div>`;
    }
}

// ==================== TOOLTIP PER SLICE ====================
function showSliceTooltip(slice, x, y) {
    const oldTooltip = document.querySelector('.pie-tooltip');
    if (oldTooltip) oldTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'pie-tooltip';
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y - 10}px`;
    
    let content = `
        <strong>${slice.label}</strong><br>
        ${slice.value.toFixed(2)}% of total supply
    `;

    if (slice.label === "Others") {
        content += `<br><small style="color:#94a3b8;">Remaining holders</small>`;
    } else if (slice.wallet) {
        content += `<br><small style="color:#94a3b8;">${slice.wallet}</small>`;
    }

    tooltip.innerHTML = content;
    document.body.appendChild(tooltip);

    
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 50);
}
/* =========================
LOAD WHALE ACTIVITY 
========================= */
async function loadLargeTx(contractAddress) {
    if (!contractAddress) return;

    let txSection = document.getElementById('largeTxSection');
    if (txSection) txSection.remove();

    txSection = document.createElement('div');
    txSection.id = 'largeTxSection';

    txSection.innerHTML = `
        <h4 style="color:#00c4ff; margin:0 0 16px 0; font-size:14.5px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-whale"></i> 
            WHALE ACTIVITY (24H)
        </h4>

        <div id="largeTxContent">
            <div style="text-align:center; padding:60px 20px; color:#64748b;">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>
                Loading whale activity...
            </div>
        </div>

        <style>
            .whale-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 18px;
            }
            @media (max-width: 768px) {
                .whale-grid { grid-template-columns: 1fr; }
            }

            .whale-box {
             
                padding: 16px;
                border-radius: 16px;
                border: 1px solid #2fbcf36e;
            }

            .whale-title {
                font-size: 13.8px;
                font-weight: 600;
                color: #00c4ff;
                margin-bottom: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .large-tx-scroll {
                max-height: 380px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-right: 6px;
            }

            .large-tx-scroll::-webkit-scrollbar {
                width: 5px;
            }
            .large-tx-scroll::-webkit-scrollbar-thumb {
                background: #334155;
                border-radius: 10px;
            }

            .tx-item {
                display: flex;
                align-items: center;
                background: #1e2937;
                padding: 11px 12px;
                border-radius: 12px;
                font-size: 13.2px;
                transition: all 0.2s;
            }

            .tx-item:hover {
                background: #273549;
            }

            .tx-time {
                min-width: 58px;
                color: #94a3b8;
            }

            .tx-value {
                flex: 1;
                text-align: right;
                font-weight: 600;
                color: #e2e8f0;
            }

            .volume-chart {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .volume-bar {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .volume-label {
                width: 78px;
                font-size: 13px;
                color: #94a3b8;
            }

            .bar-bg {
                flex: 1;
                height: 30px;
                background: #1e2937;
                border-radius: 10px;
                overflow: hidden;
                    border: solid 1px #26c761;
            }

            .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #22c55e, #86efac);
                display: flex;
                align-items: center;
                padding: 0 12px;
                color: white;
                font-weight: 700;
                font-size: 14.5px;
            }
        </style>
    `;

    const output = document.getElementById('output');
    if (output) output.appendChild(txSection);

    try {
        const res = await fetch(`backend/tokentx.php?chain=bsc&contract=${encodeURIComponent(contractAddress)}`);
        const data = await res.json();

        const contentEl = document.getElementById('largeTxContent');

        const largeTx = data.largeTx || [];
        const counts = data.counts || {};

        if (largeTx.length === 0 && Object.keys(counts).length === 0) {
            contentEl.innerHTML = `
                <div style="color:#94a3b8; text-align:center; padding:60px 20px;">
                    No whale activity data available
                </div>`;
            return;
        }

        let html = `<div class="whale-grid">`;

        // ==================== LEFT: LARGE TRANSFERS ====================
        html += `
        <div class="whale-box">
            <div class="whale-title">
                <i class="fa-solid fa-arrow-up"></i> Large Transfers (${largeTx.length})
            </div>
            <div class="large-tx-scroll">`;

        largeTx.forEach(tx => {
            html += `
                <div class="tx-item">
                    <div class="tx-time">${tx.timeAgo}</div>
                    <div class="tx-value">$${Number(tx.valueUSD).toLocaleString('en-US')}</div>
                    <a href="https://bscscan.com/tx/${tx.txHash}" target="_blank" style="margin-left:10px; color:#60a5fa;">
                        <i class="fa-solid fa-up-right-from-square"></i>
                    </a>
                </div>`;
        });

        html += `</div></div>`;

        // ==================== RIGHT: BUY VOLUME CHART ====================
        html += `
        <div class="whale-box">
            <div class="whale-title">
                <i class="fa-solid fa-dollar-sign"></i> Buy Transaction
            </div>
            <div class="volume-chart">`;

        const timeframes = [
            { label: "5m",  value: counts.count5m  || 0 },
            { label: "1h",     value: counts.count1h  || 0 },
            { label: "4h",    value: counts.count4h  || 0 },
            { label: "24h",   value: counts.count24h || 0 }
        ];

        timeframes.forEach(item => {
            const val = Number(item.value);
            const perc = Math.min(98, (val / 10000) * 100); // skala visual maks 98%

            html += `
                <div class="volume-bar">
                    <div class="volume-label">${item.label}</div>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width: ${perc}%;">
                            $${val.toLocaleString('en-US')}
                        </div>
                    </div>
                </div>`;
        });

        html += `</div></div>`;
        html += `</div>`; // end whale-grid

        contentEl.innerHTML = html;

    } catch (err) {
        console.error("Whale Error:", err);
        document.getElementById('largeTxContent').innerHTML = `
            <div style="color:#ff5555; text-align:center; padding:50px 20px;">
                Failed to load whale activity
            </div>`;
    }
}
/* =========================
SOCIAL RADAR WITH DEBUG MODE
========================= */
async function loadSocialRadar(contractAddress) {
    const outputDiv = document.getElementById('socialRadarGrid');

    // remove old
    const old = document.getElementById('socialRadarSection');
    if (old) old.remove();
    
    const socialSection = document.createElement('div');
    socialSection.id = 'socialRadarSection';
    socialSection.style.cssText = `
        margin-top: 35px; 
        padding-top: 25px; 
        border-top: 1px dashed #00f0ff;
    `;

    socialSection.innerHTML = `
        <h3 style="color:#00c4ff; margin-bottom:15px; display:flex; align-items:center; gap:10px;">
            <i class="fa-solid fa-satellite-dish"></i> 
            SOCIAL X (Twitter) RADAR • 
        </h3>
        
        <div id="socialRadarContent">
            <div style="text-align:center; padding:50px 20px; color:#64748b;">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>
                Loading social intelligence...
            </div>
        </div>
    `;

    outputDiv.appendChild(socialSection);

    try {
        const res = await fetch(`https://pokebookai.com/backend/social_radar.php?chainId=56&contract=${encodeURIComponent(contractAddress)}`);
        const data = await res.json();

        if (!data.success) {
            document.getElementById('socialRadarContent').innerHTML = `
                <div style="background:rgba(255,100,100,0.1); border:1px solid #ff5555; border-radius:12px; padding:20px; text-align:center;">
                    <p style="color:#ff5555">❌ ${data.message || 'Failed to load social data'}</p>
                </div>`;
            return;
        }

        const d = data.data;
        const influencers = d.top_influencers || [];

        // 🔥 GRID START
        let infHTML = `<div class="influencer-grid">`;

        influencers.forEach(inf => {
            const followers = Number(inf.followers || 0);
            const interactions = Number(inf.interactions || 0);
        
            infHTML += `
                <div class="inf-card">
                    <div class="inf-row">
                        <span class="inf-handle">@${inf.handle}</span>
                        <span class="inf-interactions">${interactions.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="inf-followers">
                       Followers : ${followers.toLocaleString('id-ID')}
                    </div>
                </div>
            `;
        });

        infHTML += `</div>`;
        // 🔥 GRID END

        document.getElementById('socialRadarContent').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:25px;">
                <div>
                    <div style="color:#00c4ff; font-size:13px;">X ACCOUNT</div>
                    <a href="${d.twitter_url}" target="_blank" style="color:#60a5fa; font-size:16px; font-weight:600;">
                        @${d.twitter_handle || 'N/A'}
                    </a>
                    <div style="margin-top:12px;">
                        <div style="color:#94a3b8; font-size:13px;">Total Followers</div>
                        <div style="font-size:26px; font-weight:bold;">
                            ${Number(d.followers || 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
                <div>
                    <div style="color:#00c4ff; font-size:13px;">ENGAGEMENT 24H</div>
                    <div style="font-size:28px; font-weight:bold; color:#4ade80;">
                        ${Number(d.growth || 0).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            <div>
                <div style="color:#00c4ff; font-size:14px; margin-bottom:12px;">
                    TOP SMART FOLLOWERS & KOL INTERACTIONS
                </div>
                ${infHTML || '<p style="color:#666; text-align:center;">No influencer data available</p>'}
            </div>
        `;

    } catch (err) {
        console.error("Social Radar Error:", err);
        document.getElementById('socialRadarContent').innerHTML = `
            <p style="color:#ff5555">Could not connect to Social Radar API.</p>`;
    }
}

function renderGeckoChart(poolAddress) {
    if (!poolAddress) {
        return `
            <div style="padding:20px; text-align:center; color:#ffaa00;">
                Chart not available
            </div>
        `;
    }

    const cacheBuster = Date.now(); // 🔥 

    return `
        <div style="
            width:100%;
            height:620px;
            margin-bottom:25px;
            border-radius:12px;
            overflow:hidden;
            border:solid 1px #24aaff;
        ">
            <iframe 
                key="${poolAddress}"
                height="100%" 
                width="100%" 
                src="https://www.geckoterminal.com/bsc/pools/${poolAddress}?embed=1&info=0&swaps=0&chart_type=price&resolution=1d&_=${cacheBuster}"
                frameborder="0"
                allow="clipboard-write"
                allowfullscreen>
            </iframe>
        </div>
    `;
}
async function getBestPoolFromDexscreener(token) {
    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`);
        const data = await res.json();

        if (!data.pairs || data.pairs.length === 0) return null;

        // filter BSC only
        const bscPairs = data.pairs.filter(p => p.chainId === "bsc");

        if (bscPairs.length === 0) return null;

        // 
        const bestPair = bscPairs.sort((a, b) => {
            return (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
        })[0];

        return bestPair?.pairAddress || null;

    } catch (e) {
        console.error("Dexscreener error:", e);
        return null;
    }
}


/* =========================
SAVE PORTFOLIO
========================= */
async function saveToPortfolio() {
    if (!window.walletAddress) {
        showCenterPopup("Please connect your wallet first!", "warning");
        return;
    }

    if (!currentTokenAddress) {
        showCenterPopup("Please scan a token first!", "warning");
        return;
    }

    const ticker = currentSymbol || "TOKEN";

    let currentPrice = 0;

    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${currentTokenAddress}`);
        const data = await res.json();

        if (data.pairs?.length) {
            const pair = data.pairs.find(p => p.chainId === "bsc") || data.pairs[0];
            currentPrice = parseFloat(pair.priceUsd || 0);
        }
    } catch {}

    showPortfolioModal(
        ticker,
        "",
        currentPrice ? currentPrice.toFixed(8) : "0",
        currentTokenAddress
    );
}

/* =========================
LOAD PORTFOLIO (FINAL BALANCED)
========================= */
async function loadPortfolio() {
    const output = document.getElementById('output');
    if (!output) return;

    let section = document.getElementById('portfolioSection');
    if (section) section.remove();

    section = document.createElement('div');
    section.id = 'portfolioSection';
    section.className = 'portfolio-container';

    output.appendChild(section);

    try {
        const res = await fetch(`/backend/portfolio.php?action=list&wallet=${encodeURIComponent(window.walletAddress)}`);
        const data = await res.json();

        let totalValue = 0;
        let totalBought = 0;

        let html = `
        <div class="portfolio-header">
            <h4>
                <i class="fa-solid fa-briefcase"></i> 
                MY PORTFOLIO 
                <span id="totalPnl" class="pf-total">...</span>
            </h4>
            <button onclick="saveToPortfolio()" class="add-btn">+ Add Token</button>
        </div>
        `;

        if (!data.success || !data.portfolio || data.portfolio.length === 0) {
            html += `
            <div class="portfolio-empty">
                No tokens yet.<br>
                <small>Add your first token</small>
            </div>`;
        } else {
            html += `<div class="portfolio-list">`;

            for (const item of data.portfolio) {

                const amount = parseFloat(item.amount) || 0;
                const buyPrice = parseFloat(item.buy_price) || 0;
                const boughtValue = amount * buyPrice;

                const short = item.token_address.substring(0,8) + "..." + item.token_address.slice(-4);

                let valueUSD = 0;

                try {
                    const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${item.token_address}`);
                    const dexData = await dexRes.json();

                    if (dexData.pairs?.length) {
                        const pair = dexData.pairs.find(p => p.chainId === "bsc") || dexData.pairs[0];
                        const price = parseFloat(pair.priceUsd || 0);
                        valueUSD = amount * price;
                    }
                } catch {}

                totalValue += valueUSD;
                totalBought += boughtValue;

                html += `
                <div class="portfolio-card">
                
                    <div class="pf-left">
                        <div class="pf-symbol">${item.symbol || 'UNKNOWN'}</div>
                        <div class="pf-address">${short}</div>
                    </div>
                
                    <div class="pf-center">
                
                        <div class="pf-block">
                            <span>Amount</span>
                            <strong>
                                ${amount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:8})}
                            </strong>
                        </div>
                
                        <div class="pf-block">
                            <span>Buy @</span>
                            <strong class="pf-buy">
                                ${buyPrice > 0 ? `$${buyPrice.toFixed(6)}` : '-'}
                            </strong>
                        </div>
                
                        <div class="pf-block">
                            <span>Bought</span>
                            <strong class="pf-bought">
                                ${boughtValue > 0 ? `$${boughtValue.toFixed(2)}` : '-'}
                            </strong>
                        </div>
                
                        <div class="pf-block">
                            <span>Value</span>
                            <strong class="pf-value">
                                $${valueUSD.toLocaleString('en-US', {minimumFractionDigits:2})}
                            </strong>
                        </div>
                
                    </div>
                
                    <div class="pf-actions">
                        <button onclick="editPortfolio('${item.token_address}','${item.symbol}',${amount},${buyPrice})" class="edit-btn">
                            Edit
                        </button>
                        <button onclick="deleteFromPortfolio('${item.token_address}','${item.symbol}')" class="delete-btn">
                            Delete
                        </button>
                    </div>
                
                </div>`;
            }

            html += `</div>`;
        }

        section.innerHTML = html;

        // ✅ TOTAL PnL  HEADER
        const totalPnl = totalValue - totalBought;
        const totalPercent = totalBought > 0 ? (totalPnl / totalBought) * 100 : 0;

        const pnlEl = document.getElementById('totalPnl');
        if (pnlEl) {
            pnlEl.innerHTML = `
                ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)} 
                (${totalPercent.toFixed(2)}%)
            `;
            pnlEl.className = totalPnl >= 0 ? 'pf-profit' : 'pf-loss';
        }

    } catch (err) {
        console.error(err);
        section.innerHTML = `<p style="color:red;text-align:center;">Failed to load portfolio</p>`;
    }
}
/* =========================
CENTER POPUP
========================= */
function showCenterPopup(message, type = "info") {
    const popup = document.createElement('div');
    popup.innerHTML = `
    <div class="popup-overlay">
        <div class="popup-box">${message}</div>
    </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
}

/* =========================
PORTFOLIO MODAL (ADD + EDIT)
========================= */
function showPortfolioModal(ticker, defaultAmount = "", defaultPrice = "0", tokenAddr = null) {
    const modal = document.createElement('div');

    modal.innerHTML = `
    <div class="prot-popup-overlay">
        <div class="prot-popup-box">

            <div class="prot-popup-title">
                ${tokenAddr ? 'Edit' : 'Add'} ${ticker}
            </div>
            
            <input id="modalAmount" class="prot-input" placeholder="Amount" value="${defaultAmount}">
            <p>BUY AT:</p>    
            <input id="modalBuyPrice" class="prot-input" placeholder="Buy price ($)" value="${defaultPrice}">

            <div class="prot-actions">
                <button id="cancelBtn" class="prot-btn prot-cancel">Cancel</button>
                <button id="okBtn" class="prot-btn prot-save">${tokenAddr ? 'Update' : 'Save'}</button>
            </div>

        </div>
    </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('okBtn').onclick = async () => {
        const amount = parseFloat(document.getElementById('modalAmount').value);
        const buyPrice = parseFloat(document.getElementById('modalBuyPrice').value);

        if (isNaN(amount) || amount <= 0) {
            showCenterPopup("Invalid amount", "error");
            return;
        }

        if (isNaN(buyPrice) || buyPrice < 0) {
            showCenterPopup("Invalid buy price", "error");
            return;
        }

        modal.remove();

        try {
            const res = await fetch('/backend/portfolio.php?action=add', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    wallet: window.walletAddress,
                    token_address: tokenAddr || currentTokenAddress,
                    amount,
                    symbol: ticker,
                    buy_price: buyPrice
                })
            });

            const data = await res.json();

            if (data.success) {
                showCenterPopup("Saved!", "success");
                loadPortfolio();
            }

        } catch (err) {
            console.error(err);
        }
    };

    document.getElementById('cancelBtn').onclick = () => modal.remove();
}

/* =========================
EDIT
========================= */
function editPortfolio(tokenAddr, symbol, amount, buyPrice) {
    showPortfolioModal(symbol, amount, buyPrice, tokenAddr);
}

/* =========================
DELETE (PROT POPUP)
========================= */
function deleteFromPortfolio(tokenAddr, symbol = '') {

    const modal = document.createElement('div');

    modal.innerHTML = `
    <div class="prot-popup-overlay">
        <div class="prot-popup-box">

            <div class="prot-popup-title prot-danger-title">
                Delete Token
            </div>

            <div class="prot-delete-text">
                Are you sure you want to delete 
                <strong>${symbol || 'this token'}</strong> ?
            </div>

            <div class="prot-actions">
                <button id="cancelDelete" class="prot-btn prot-cancel">
                    Cancel
                </button>
                <button id="confirmDelete" class="prot-btn prot-danger">
                    Delete
                </button>
            </div>

        </div>
    </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelDelete').onclick = () => modal.remove();

    modal.querySelector('#confirmDelete').onclick = async () => {
        modal.remove();

        try {
            const res = await fetch('/backend/portfolio.php?action=delete', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    wallet: window.walletAddress,
                    token_address: tokenAddr
                })
            });

            const data = await res.json();

            if (data.success) {
                showCenterPopup("🗑 Token deleted", "success");
                loadPortfolio();
            } else {
                showCenterPopup(data.message || "Delete failed", "error");
            }

        } catch (err) {
            console.error(err);
            showCenterPopup("Delete error", "error");
        }
    };
}

/* =========================
GLOBAL POPUP STYLE
========================= */
const style = document.createElement('style');
style.innerHTML = `
.popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
}

.popup-box {
    padding: 22px 30px;
    border-radius: 14px;
    width: 90%;
    max-width: 420px;
    text-align: center;
    box-shadow: 0 30px 80px rgba(0,0,0,0.8);
    animation: pop 0.25s ease;
}

@keyframes pop {
    from { transform: scale(0.8); opacity: 0 }
    to { transform: scale(1); opacity: 1 }
}
`;
document.head.appendChild(style);
/* =========================
SCAN TOKEN + MOBILE TAB SYSTEM (FINAL FIXED + TECHNICAL ANALYSIS)
========================= */
async function scanToken(isAuto = false) {
    const input = document.getElementById('tokenAddress');
    const output = document.getElementById('output');
    const metricsEl = document.getElementById('metrics');

    if (!input || !output) return;

    const addr = input.value.trim();
    if (!/^0x[a-f0-9]{40}$/i.test(addr)) {
        if (!isAuto) alert('Invalid BSC address! Must start with 0x...');
        return;
    }

    // Loading UI
    output.innerHTML = `
        <p>> SCANNING TOKEN...</p>
        <p>> CONNECTING TO BINANCE SMART CHAIN...</p>
        <p>> ANALYZING LIQUIDITY & AGENT STATUS...</p>
        <p>> FETCHING SOCIAL INTELLIGENCE...</p>
        <p>> LOADING TECHNICAL ANALYSIS...</p>
    `;

    if (metricsEl) metricsEl.innerHTML = `Checking token status...`;

    try {
        const res = await fetch('/backend/home_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'address=' + encodeURIComponent(addr) + '&chain=bsc'
        });

        const data = await res.json();

        if (data.error) {
            output.innerHTML = `<p style="color:red">${data.error}</p>`;
            return;
        }

        // ================= AGENT STATUS =================
        if (metricsEl) {
            if (data.agent) {
                metricsEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;gap:10px;align-items:center;">
                        <a href="/profile?username=${data.agent.username}">
                            <img src="${data.agent.profile_image || 'default.png'}" style="width:45px;height:45px;border-radius:50%;">
                        </a>
                        <div>
                            <div style="color:#00c4ff;font-size:15px;font-weight:bold;">
                                @${data.agent.username}
                                ${data.agent.verify === 'yes' ? '<i class="fa-solid fa-certificate" style="color:#ffaf00;"></i>' : ''}
                            </div>
                            <div style="font-size:11px;color:#00f0ff;">LISTED ON pCLAW</div>
                            <div style="font-size:11px;color:${data.agent.verify === 'yes' ? '#ffaf00' : '#ff5555'};">
                                ${data.agent.verify === 'yes' ? 'OFFICIALLY VERIFIED' : 'UNVERIFIED'}
                            </div>
                        </div>
                    </div>
                    <div style="text-align:center;background:rgba(0,255,170,0.1);padding:8px 14px;border-radius:10px;">
                        <div style="font-size:10px;color:#00c4ff;">AGENT POSTS</div>
                        <div style="font-size:18px;font-weight:bold;color:#fff;">
                            ${data.agent.total_posts ?? 0}
                        </div>
                    </div>
                </div>`;
            } else {
                metricsEl.innerHTML = `<div style="text-align:center;color:#ffaa00;font-size:13px;">NOT LISTED ON pCLAW</div>`;
            }
        }

        updateSwapUI(data.ticker, addr, data.preferredPair || "BNB", data.preferredFromToken);

        document.getElementById("swapAmount").value = "";
        document.getElementById("swapOutput").value = "";
        document.getElementById("swapStatus").textContent = "";

        const adv = data.advanced || {};
        const bn = data.binance || {};
        const poolAddress = await getBestPoolFromDexscreener(addr);

        // ================= COMMON CONTENT =================
        let commonHTML = `
        ${renderGeckoChart(poolAddress)}
        <h3>> TOKEN: ${data.ticker || 'UNKNOWN'} (BSC)</h3>
        <p>> PRICE: <strong>${data.price || '-'}</strong></p>`;

        if (data.ai_summary) {
            commonHTML += `
            <h4 style="color:#00c4ff;margin-top:20px;">🤖 AI MARKET INSIGHT</h4>
            <div style="background:#001aff4f;padding:14px;border-radius:10px;">
                ${data.ai_summary}
            </div>`;
        }

        commonHTML += `
        <div class="two-column-grid">
            <div class="two-column-card">
                <h4>📊 HOLDERS & TRACKERS</h4>
                <table class="token-table" style="width:100%">
                    <tr><td>Top 10 Holders</td><td style="text-align:right">${adv.top10HoldersPercentage || 'N/A'}%</td></tr>
                    <tr><td>KOL Holders</td><td style="text-align:right">${adv.kolHolders || 'N/A'} (${adv.kolHoldingPercent || 'N/A'}%)</td></tr>
                    <tr><td>Pro Traders</td><td style="text-align:right">${adv.proHolders || 'N/A'} (${adv.proHoldingPercent || 'N/A'}%)</td></tr>
                    <tr><td>Smart Money</td><td style="text-align:right">${adv.smartMoneyHolders || bn.smartMoneyHolders || 'N/A'}</td></tr>
                    <tr><td>Total Holders</td><td style="text-align:right">${bn.holders || 'N/A'}</td></tr>
                </table>
            </div>

            <div class="two-column-card">
                <h4>📈 MARKET DATA</h4>
                <table class="token-table" style="width:100%">
                    <tr><td>Market Cap</td><td style="text-align:right">$${bn.marketCap ? Number(bn.marketCap).toLocaleString() : 'N/A'}</td></tr>
                    <tr><td>Liquidity</td><td style="text-align:right">$${bn.liquidity ? Number(bn.liquidity).toLocaleString() : 'N/A'}</td></tr>
                    <tr><td>24h Volume</td><td style="text-align:right">$${bn.volume24h ? Number(bn.volume24h).toLocaleString() : 'N/A'}</td></tr>
                    <tr>
                        <td>24h Change</td>
                        <td style="text-align:right;color:${parseFloat(bn.percentChange24h || 0) >= 0 ? '#22c55e' : '#ef4444'}">
                            ${bn.percentChange24h ?? '0'}%
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        const isMobile = window.innerWidth <= 768;

   
        if (isMobile) {
            output.innerHTML = `
                <div id="tokenMarketSection" class="tab-content active"></div>
                <div id="swapSection" class="tab-content"></div>
            `;

            const tokenMarketSection = document.getElementById('tokenMarketSection');
            const swapSection = document.getElementById('swapSection');

            tokenMarketSection.innerHTML = commonHTML;

     
            await loadAIPrediction(addr);
            await loadTechnicalAnalysis(addr);    
            loadSocialRadar(addr);
            await loadLargeTx(addr);

            const aiPred = document.getElementById('aiPredictionSection');
            const techSection = document.getElementById('technicalAnalysisSection');  // ← BARU
            const largeTxSec = document.getElementById('largeTxSection');
            const socialRadar = document.getElementById('socialRadarSection');

            if (aiPred) tokenMarketSection.appendChild(aiPred);
            if (techSection) tokenMarketSection.appendChild(techSection);   // Technical Analysis
            if (largeTxSec) tokenMarketSection.appendChild(largeTxSec);
            if (socialRadar) tokenMarketSection.appendChild(socialRadar);

            const inlineSwapBox = document.getElementById('inlineSwapBox');
            if (inlineSwapBox) {
                inlineSwapBox.style.display = "block";
                swapSection.appendChild(inlineSwapBox);
            }

            await loadTopHolders(addr);

            const topHoldersSec = document.getElementById('topHoldersSection');
            if (topHoldersSec) {
                swapSection.appendChild(topHoldersSec);
            }

            setTimeout(initMobileFooterTabs, 600);

        } else {
            // ================= DESKTOP =================
            output.innerHTML = commonHTML;

            await loadAIPrediction(addr);
            await loadTechnicalAnalysis(addr);     
            await loadTopHolders(addr);
            await loadLargeTx(addr);
            loadSocialRadar(addr);

            const inlineSwapBox = document.getElementById('inlineSwapBox');
            if (inlineSwapBox) inlineSwapBox.style.display = "block";
        }

        setTimeout(loadPortfolio, 1600);

    } catch (err) {
        console.error("SCAN ERROR:", err);
        output.innerHTML = `<p style="color:red">SCAN FAILED: ${err.message}</p>`;
    }
}

/* =========================
QUOTE HANDLER
========================= */
let quoteTimeout = null;

async function handleAmountInput() {
    const amountStr = document.getElementById("swapAmount").value.trim();
    const outputEl = document.getElementById("swapOutput");
    const statusEl = document.getElementById("swapStatus");

    if (!amountStr || parseFloat(amountStr) <= 0 || !currentTokenAddress) {
        outputEl.value = "";
        statusEl.textContent = "";
        updateWalletUIState();
        return;
    }

    clearTimeout(quoteTimeout);
    quoteTimeout = setTimeout(async () => {
        outputEl.value = "Calculating...";
        statusEl.innerHTML = `<span style="color:#ffaa00">Finding best route...</span>`;

        const amountIn = ethers.utils.parseUnits(amountStr, 18).toString();

        try {
            const url = `/backend/swap.php?action=quote&fromToken=${currentFromToken}&toToken=${currentTokenAddress}&amount=${amountIn}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const outAmount = parseFloat(data.amountOut) / 1e18;
            const display = (outAmount < 0.001) ? outAmount.toFixed(8) : outAmount.toFixed(6);

            outputEl.value = display;
            statusEl.innerHTML = `<span style="color:#00c4ff">Route Found </span>`;

        } catch (err) {
            console.error("QUOTE ERROR:", err);
            outputEl.value = "—";
            statusEl.innerHTML = `<span style="color:red">No liquidity available</span>`;
        }

        updateWalletUIState();
    }, 650);
}

/* =========================
EXECUTE SWAP
========================= */
async function executeSwap() {
    if (!window.walletAddress) {
        alert("Please connect your wallet first!");
        return;
    }
    if (!currentTokenAddress) {
        alert("Please scan a token first!");
        return;
    }

    const amountStr = document.getElementById("swapAmount").value.trim();
    if (!amountStr || parseFloat(amountStr) <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    const statusEl = document.getElementById("swapStatus");
    statusEl.innerHTML = `<span style="color:#ffaa00">Processing transaction...</span>`;

    try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wallet = await signer.getAddress();

        const amountIn = ethers.utils.parseUnits(amountStr, 18).toString();

        const fromToken = normalizeToken(currentFromToken);
        const toToken   = normalizeToken(currentTokenAddress);

        const res = await fetch(`/backend/swap.php?action=swap&fromToken=${fromToken}&toToken=${toToken}&amount=${amountIn}&fromAddress=${wallet}&slippage=1`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // 1inch Priority
        if (data.dex === "1inch" && data.data) {
            statusEl.innerHTML = `<span style="color:#00c4ff">Sending ...</span>`;
            const tx = await signer.sendTransaction({
                to: data.to,
                data: data.data,
                value: data.value || "0"
            });
            await tx.wait();
            statusEl.innerHTML = `<span style="color:#00c4ff">✅ Swap Successful </span>`;
            return;
        }

        // PancakeSwap Fallback
        statusEl.innerHTML = `<span style="color:#ffaa00">Confirm Transaction</span>`;

        if (data.v2) {
            try {
                await swapV2(data.v2, signer, amountIn);
                statusEl.innerHTML = `<span style="color:#00c4ff">✅ Swap Successful (/span>`;
                return;
            } catch (e) { 
                console.log("V2 failed:", e); 
            }
        }

        if (data.v3) {
            try {
                await swapV3(data.v3, signer, amountIn);
                statusEl.innerHTML = `<span style="color:#00c4ff">✅ Swap Successful (/span>`;
                return;
            } catch (e) { 
                console.log("V3 failed:", e); 
            }
        }

        throw new Error("Transaction Failed");

    } catch (err) {
        console.error("SWAP ERROR:", err);

        // Detect wallet cancellation
        if (err.code === 4001 || err.message.toLowerCase().includes("rejected") || err.message.toLowerCase().includes("cancel")) {
            statusEl.innerHTML = `<span style="color:#ffaa00">Transaction cancelled by wallet</span>`;
        } else {
            statusEl.innerHTML = `<span style="color:red">${err.message || "Swap failed"}</span>`;
        }
    }
}

/* =========================
PANCAKE V2 SWAP
========================= */
async function swapV2(v2, signer, amountIn) {
    const router = new ethers.Contract(v2.router, [
        "function swapExactETHForTokens(uint256,address[],address,uint256) payable",
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
    ], signer);

    const deadline = Math.floor(Date.now() / 1000) + 600;
    const path = v2.path;
    const wallet = await signer.getAddress();

    const isETHIn = path[0].toLowerCase() === "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

    if (isETHIn) {
        return await router.swapExactETHForTokens(0, path, wallet, deadline, { value: amountIn });
    } else {
        const tokenIn = new ethers.Contract(path[0], ["function approve(address,uint256)"], signer);
        await tokenIn.approve(v2.router, amountIn);
        return await router.swapExactTokensForTokens(amountIn, 0, path, wallet, deadline);
    }
}

/* =========================
PANCAKE V3 SWAP
========================= */
async function swapV3(v3, signer, amountIn) {
    const router = new ethers.Contract(v3.router, [
        "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) payable returns (uint256)"
    ], signer);

    const wallet = await signer.getAddress();
    const fees = v3.fees || [500, 2500, 10000];

    for (let fee of fees) {
        try {
            const params = [v3.tokenIn, v3.tokenOut, fee, wallet, amountIn, "0", "0"];
            const tx = await router.exactInputSingle(params);
            await tx.wait();
            return tx;
        } catch (e) {
            console.log(`V3 fee ${fee} failed`);
        }
    }
    throw new Error("No V3 pool available");
}

/* =========================
INITIALIZATION
========================= */
window.addEventListener("load", () => {
    const swapBox = document.getElementById("inlineSwapBox");
    if (swapBox) swapBox.style.display = "none";

    const amountEl = document.getElementById("swapAmount");
    if (amountEl) amountEl.addEventListener("input", handleAmountInput);

    updateWalletUIState();

    // Auto scan from URL parameter
    const params = new URLSearchParams(window.location.search);
    const address = params.get("address");
    if (address) {
        const input = document.getElementById("tokenAddress");
        if (input) {
            input.value = address;
            setTimeout(() => scanToken(true), 400);
        }
    }

    window.addEventListener('walletConnected', updateWalletUIState);
    window.addEventListener('walletDisconnected', updateWalletUIState);
});
function openWalletPopup() {
    const popup = document.getElementById('walletSelectPopup');
    if (popup) {
        popup.classList.add('show');
        console.log('Popup open');
    } else {
        console.error('❌ ID walletSelectPopup not founde');
    }
}

function closeWalletPopup() {
    const popup = document.getElementById('walletSelectPopup');
    if (popup) {
        popup.classList.remove('show');
        console.log('Popup Close');
    }
}

window.addEventListener('walletConnected', () => {
    updateWalletUIState();

    if (window.walletAddress) {
        loadPortfolio();
    }
});

window.addEventListener('walletDisconnected', () => {
    updateWalletUIState();

    const section = document.getElementById('portfolioSection');
    if (section) section.remove();
});




/* =========================
EXPOSE FUNCTIONS TO GLOBAL
========================= */
window.scanToken = scanToken;
window.executeSwap = executeSwap;
