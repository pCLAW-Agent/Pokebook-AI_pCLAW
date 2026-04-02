// ======================
// GLOBAL STATE
// ======================
let userWallet = "";
let selectedPlatform = "";

// ======================
// SHORT ADDRESS
// ======================
function shortAddress(addr){
    return addr.slice(0,6) + "..." + addr.slice(-4);
}

// ======================
// CONNECT WALLET (BSC)
// ======================
async function connectWallet(){

    
    if(userWallet){
        document.getElementById("disconnectModal").style.display = "flex";
        return;
    }

    if(!window.ethereum){
        alert("MetaMask not installed");
        return;
    }

    try{

        let chainId = await ethereum.request({ method: 'eth_chainId' });

        if(chainId !== "0x38"){
            alert("Please switch to BSC network");
            return;
        }

        let accounts = await ethereum.request({
            method: "eth_requestAccounts"
        });

        userWallet = accounts[0];

     
        document.getElementById("connectBtn").innerText = shortAddress(userWallet);

    }catch(e){
        console.error(e);
        alert("Wallet connection failed");
    }
}

// ======================
// DISCONNECT WALLET
// ======================
function disconnectWallet(){
    userWallet = "";
    document.getElementById("connectBtn").innerText = "CONNECT WALLET";
    closeDisconnect();
}

function closeDisconnect(){
    document.getElementById("disconnectModal").style.display = "none";
}

// ======================
// SELECT PLATFORM
// ======================
function selectPlatform(type){

    selectedPlatform = type;

    document.getElementById("platform").value = type;
    document.getElementById("agentForm").classList.remove("hidden");

    highlightPlatform(type);

    // hide platform lain
    if(type === "telegram"){
        let x = document.getElementById("xOption");
        if(x) x.style.display = "none";
    }

    if(type === "x"){
        let tg = document.getElementById("telegramOption");
        if(tg) tg.style.display = "none";
    }
}

// ======================
// UI HIGHLIGHT
// ======================
function highlightPlatform(type){

    let options = document.querySelectorAll(".option");

    options.forEach(el => el.classList.remove("active"));

    options.forEach(el => {
        if(el.innerText.toLowerCase().includes(type)){
            el.classList.add("active");
        }
    });

}

// ======================
// SUCCESS POPUP
// ======================
function showSuccessPopup(){

    let popup = document.getElementById("successModal");
    let timerEl = document.getElementById("countdown");

    popup.style.display = "flex";

    let time = 3;
    timerEl.innerText = time;

    let interval = setInterval(()=>{

        time--;
        timerEl.innerText = time;

        if(time <= 0){
            clearInterval(interval);
            window.location.href = "https://pokebookai.com";
        }

    },1000);
}

// ======================
// FORM SUBMIT
// ======================
document.addEventListener("DOMContentLoaded", () => {

    let form = document.getElementById("agentForm");

    if(!form) return;

    form.addEventListener("submit", async function(e){

        e.preventDefault();

        // ======================
        // VALIDATION
        // ======================
        if(!userWallet){
            alert("Connect wallet first");
            return;
        }

        if(!selectedPlatform){
            alert("Select platform first");
            return;
        }

        let name = document.getElementById("name").value.trim();
        let username = document.getElementById("username").value.trim();

        if(!name || !username){
            alert("Name & Username required");
            return;
        }

        // ======================
        // BUILD DATA
        // ======================
        let data = {
            name: name,
            username: username,
            image: document.getElementById("image").value,
            token: document.getElementById("token").value,
            telegram_token: document.getElementById("telegram_token").value,
            platform: selectedPlatform,
            owner_address: userWallet
        };

        // ======================
        // LOADING UI
        // ======================
        let btn = form.querySelector("button");
        btn.innerText = "Creating...";
        btn.disabled = true;

        try{

            let res = await fetch("backend/custome_data.php",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(data)
            });

            let result = await res.json();

            if(result.status === "success"){

                // 🔥 
                showSuccessPopup();

                form.reset();

            }else{
                alert("❌ " + result.message);
            }

        }catch(err){
            console.error(err);
            alert("Request failed");
        }

        btn.innerText = "CREATE AGENT";
        btn.disabled = false;

    });

});

// ======================
// AUTO DETECT WALLET
// ======================
window.addEventListener("load", async () => {

    if(window.ethereum){

        try{
            let accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length > 0){
                userWallet = accounts[0];
                document.getElementById("connectBtn").innerText = shortAddress(userWallet);
            }
        }catch(e){
            console.log("Auto wallet detect failed");
        }

    }

});