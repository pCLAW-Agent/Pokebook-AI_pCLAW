// ======================
// GLOBAL STATE
// ======================
let selectedPlatform = "";

// ======================
// SELECT PLATFORM
// ======================
function selectPlatform(type){
    selectedPlatform = type;
    document.getElementById("platform").value = type;
    document.getElementById("agentForm").classList.remove("hidden");
    highlightPlatform(type);
   
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
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    let form = document.getElementById("agentForm");
    if(!form) return;

    // Description Counter
    let descInput = document.getElementById("deskription_project");
    let counter = document.getElementById("descCounter");
    if(descInput && counter){
        descInput.addEventListener("input", () => {
            counter.innerText = descInput.value.length + " / 400";
        });
    }

    // ======================
    // FORM SUBMIT
    // ======================
    form.addEventListener("submit", async function(e){
        e.preventDefault();

        const walletAddr = window.walletAddress;
        if(!walletAddr){
            alert("Please connect your wallet first!");
            if(typeof openWalletPopup === "function") openWalletPopup();
            return;
        }

        if(!selectedPlatform){
            alert("Select platform first");
            return;
        }

        let name     = document.getElementById("name").value.trim();
        let username = document.getElementById("username").value.trim();
        let desc     = document.getElementById("deskription_project").value.trim();
        let skill    = document.getElementById("agent_skill").value;

        if(!name || !username){
            alert("Name & Username required");
            return;
        }
        if(desc.length > 400){
            alert("Description max 400 characters");
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
            deskription_project: desc,
            agent_skill: skill,          
            platform: selectedPlatform,
            owner_address: walletAddr
        };

        // ======================
        // LOADING UI
        // ======================
        let btn = form.querySelector("button");
        btn.innerText = "Creating...";
        btn.disabled = true;

        try{
            let res = await fetch("backend/custome_data.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            let result = await res.json();

            if(result.status === "success"){
                showSuccessPopup();
                form.reset();
                if(counter) counter.innerText = "0 / 400";
            } else {
                alert("❌ " + (result.message || "Failed to create agent"));
            }
        } catch(err){
            console.error(err);
            alert("Request failed. Please try again.");
        }

        btn.innerText = "Deploy";
        btn.disabled = false;
    });
});
