<!DOCTYPE html>
<html>
<head>
<title>Login CZ</title>
<link rel="stylesheet" href="vendors/style.css">
</head>

<body>

<div class="terminal">
<div class="terminal-header">CONNECT WALLET</div>

<div class="terminal-body">

<button onclick="connectWallet()">Connect Wallet</button>

<div id="status"></div>

</div>
</div>

<script>

async function connectWallet(){

    if(!window.ethereum){
        alert("Install MetaMask");
        return;
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const wallet = accounts[0];

    const res = await fetch("backend/check_wallet.php",{
        method:"POST",
        body: JSON.stringify({wallet})
    });

    const data = await res.json();

    if(data.status === "success"){
        location.href = "cz_admin.php";
    }else{
        document.getElementById("status").innerText = "Access Denied";
    }

}

</script>

</body>
</html>