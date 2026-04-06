// =========================
// GLOBAL UNIVERSAL SAFE
// =========================
if (!window.walletAddress) {
  window.walletAddress = null;
}

let selectedWallet = null;
let lastWallet = null;

// =========================
// SAFE ADDRESS FORMATTER
// =========================
function shortAddress(addr) {
  if (!addr) return "";

  addr = String(addr);

  if (!addr.startsWith("0x")) return addr;

  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// =========================
// SAFE GET ADDRESS
// =========================
function getSafeAddress() {
  let addr = window.walletAddress;

  if (!addr) return null;

  addr = String(addr);

  if (!addr.startsWith("0x")) return null;

  return addr;
}

// =========================
// POPUP CONTROL
// =========================
function openWalletPopup() {
  const el = document.getElementById("walletSelectPopup");
  if (el) el.style.display = "flex";
}

function closeWalletPopup() {
  const el = document.getElementById("walletSelectPopup");
  if (el) el.style.display = "none";
}

function closePopup() {
  const el = document.getElementById("walletPopup");
  if (el) el.style.display = "none";
}

// =========================
// METAMASK (SELF)
// =========================
async function connectMetaMaskWrapper() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    // switch BSC (optional)
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }]
      });
    } catch (e) {}

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const addr = accounts[0];

    window.walletAddress = addr;
    selectedWallet = "metamask";

    onWalletConnected();

  } catch (err) {
    console.error(err);
  }
}

// =========================
// BINANCE WALLET
// =========================
async function connectBinanceWallet() {
  try {
    let accounts;

    if (window.BinanceChain) {
      accounts = await window.BinanceChain.request({
        method: "eth_requestAccounts"
      });
    } 
    else if (window.ethereum && window.ethereum.isBinance) {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
    } 
    else {
      alert("Binance Wallet not installed");
      return;
    }

    const addr = accounts[0];

    window.walletAddress = addr;
    selectedWallet = "binance";

    onWalletConnected();

  } catch (err) {
    console.error(err);
  }
}

// =========================
// AFTER CONNECT
// =========================
function onWalletConnected() {
  updateUI();
  closeWalletPopup();
  saveWallet();
}

// =========================
// UPDATE UI (SAFE)
// =========================
function updateUI() {
  const addr = getSafeAddress();
  if (!addr) return;

  // BUTTON
  const btn = document.getElementById("walletBtn");
  if (btn) {
    btn.classList.add("connected");
    btn.innerText = shortAddress(addr);
  }

  // DASHBOARD TEXT SUPPORT
  const addrBox = document.getElementById("walletAddress");
  if (addrBox) {
    addrBox.innerText = addr;
  }

  // REMOVE DUPLICATE TEXT
  const text = document.getElementById("wallet");
  if (text) text.innerText = "";
}

// =========================
// AUTO DETECT (GLOBAL SAFE)
// =========================
setInterval(() => {
  const addr = getSafeAddress();

  if (addr && addr !== lastWallet) {
    lastWallet = addr;

    updateUI();
    closeWalletPopup();
  }
}, 400);

// =========================
// SAVE DATABASE
// =========================
function saveWallet() {
  const addr = getSafeAddress();
  if (!addr) return;

  fetch("backend/wallet_data.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      wallet: addr,
      type: selectedWallet
    })
  })
  .then(res => res.text())
  .then(text => {
    try {
      console.log("Saved:", JSON.parse(text));
    } catch {
      console.log("Non JSON:", text);
    }
  });
}

// =========================
// BUTTON BEHAVIOR
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("walletBtn");
  if (!btn) return;

  btn.onclick = function () {
    const addr = getSafeAddress();

    if (!addr) {
      openWalletPopup();
    } else {
      const popup = document.getElementById("walletPopup");
      if (popup) popup.style.display = "flex";
    }
  };

  // remove duplicate text
  const text = document.getElementById("wallet");
  if (text) text.remove();
});

// =========================
// DISCONNECT
// =========================
function disconnectWallet() {
  window.walletAddress = null;
  selectedWallet = null;
  lastWallet = null;

  const btn = document.getElementById("walletBtn");
  if (btn) {
    btn.innerText = "Connect Wallet";
    btn.classList.remove("connected");
  }

  // reset dashboard text
  const addrBox = document.getElementById("walletAddress");
  if (addrBox) {
    addrBox.innerText = "NOT CONNECTED";
  }

  closePopup();
}
