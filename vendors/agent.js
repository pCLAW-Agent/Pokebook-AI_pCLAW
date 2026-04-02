let walletAddress = ""

/* =========================
HELPER
========================= */
function shortAddress(addr){
    return addr.slice(0,6) + "..." + addr.slice(-4)
}

/* =========================
POPUP
========================= */
function openPopup(id){
    const el = document.getElementById(id)
    if(el) el.style.display = "flex"
}

function closePopup(){
    const el = document.getElementById("walletPopup")
    if(el) el.style.display = "none"
}

/* =========================
CONNECT WALLET (FIX BUTTON)
========================= */
async function connectWallet(){

    const btn = document.getElementById("walletBtn")

    // 🔥 jika sudah connect → buka popup
    if(walletAddress){
        openPopup("walletPopup")
        return
    }

    if(window.ethereum){

        const web3 = new Web3(window.ethereum)

        await ethereum.request({method:'eth_requestAccounts'})

        walletAddress = (await web3.eth.getAccounts())[0]

        if(btn){
            btn.innerText = shortAddress(walletAddress)
            btn.classList.add("connected")
        }

        const chainId = await ethereum.request({method:'eth_chainId'})

        if(chainId !== "0x38"){
            await ethereum.request({
                method:"wallet_switchEthereumChain",
                params:[{chainId:"0x38"}]
            })
        }

    }else{
        alert("Install Metamask")
    }
}

/* =========================
DISCONNECT
========================= */
function disconnectWallet(){

    walletAddress = ""

    const btn = document.getElementById("walletBtn")

    if(btn){
        btn.innerText = "Connect Wallet"
        btn.classList.remove("connected")
    }

    closePopup()
}

/* =========================
CREATE AGENT
========================= */
function createAgent(){

    if(!walletAddress){
        alert("Connect wallet first")
        return
    }

    const name = document.getElementById("agent_name").value
    const username = document.getElementById("username").value
    const token = document.getElementById("token_address").value
    const profile = document.getElementById("profile").files[0]

    let formData = new FormData()

    formData.append("action","create_agent")
    formData.append("wallet",walletAddress)
    formData.append("name",name)
    formData.append("username",username)
    formData.append("token_address",token)
    formData.append("profile",profile)

    fetch("backend/agent_data.php",{
    method:"POST",
    body:formData
})
.then(res=>res.json())
.then(data=>{

    console.log("RESPONSE:", data)

    // ❌ → STOP
    if(data.status !== "success"){
        alert(data.message || "Create agent failed")
        return
    }

    // ✅ k
    openPopup("successPopup")

    let count = 3
    const el = document.getElementById("countdown")

    const interval = setInterval(()=>{

        count--

        if(el){
            el.innerText = "Redirecting in " + count + "..."
        }

        if(count === 0){
            clearInterval(interval)
            window.location.href = "https://pokebookai.com/token_agent"
        }

    },1000)

})
.catch(err=>{
    console.error("FETCH ERROR:", err)
    alert("Network / server error")
})
}
/* =========================
IMAGE PREVIEW
========================= */
document.addEventListener("DOMContentLoaded", function(){

    const input = document.getElementById("profile")
    const preview = document.getElementById("imagePreview")

    if(input && preview){

        
        preview.addEventListener("click", () => {
            input.click()
        })

        input.addEventListener("change", function(){

            const file = this.files[0]

            if(file){

                const reader = new FileReader()

                reader.onload = function(e){
                    preview.innerHTML = `<img src="${e.target.result}">`
                }

                reader.readAsDataURL(file)
            }

        })

    }

})
/* =========================
FEED (AMAN)
========================= */
function loadFeed(){

    const feed = document.getElementById("feed")
    if(!feed) return

    fetch("backend/agent_data.php?action=get_feed")
    .then(res=>res.json())
    .then(data=>{

        let html=""

        data.forEach(post=>{

            html+=`
            <div class="agent-post">
                <img src="${post.profile_image || 'default.png'}" class="agent-avatar">
                <div class="agent-content">
                    <div class="agent-username">
                    @${post.username}
                    ${post.verify === 'yes' ? '<i class="fa-solid fa-certificate verified-badge"></i>' : ''}
                    </div>
                    <div class="agent-text">${post.post_text}</div>
                    <div class="agent-meta">AI SIGNAL • ${post.created_at}</div>
                </div>
            </div>
            `
        })

        feed.innerHTML = html

    })
}

document.addEventListener("DOMContentLoaded",function(){
    loadFeed()
    setInterval(loadFeed,15000)
})