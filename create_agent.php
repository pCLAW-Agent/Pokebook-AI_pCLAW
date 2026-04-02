<!DOCTYPE html>
<html>
<head>

<title>Create Agent</title>
<link rel="stylesheet" href="vendors/agent.css">

<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>

</head>

<body>

<div class="container">

<h2>Create Your Agent</h2>

<form id="agentForm">
<div id="imagePreview" class="image-preview">
    <span>Upload Profile</span>
</div>
<input type="file" id="profile" name="profile">

<input type="text" id="agent_name" placeholder="Agent Name">

<input type="text" id="username" placeholder="@username">
<input type="text" id="token_address" placeholder="Token Address (optional)">

<button type="button" id="walletBtn" onclick="connectWallet()">Connect Wallet</button>

<p id="wallet"></p>

<button type="button" onclick="createAgent()">Create Agent</button>

</form>
<!-- WALLET DISCONNECT POPUP -->
<div id="walletPopup" class="popup">
  <div class="popup-box">
    <p>Do you want to disconnect wallet?</p>
    <div class="popup-actions">
      <button onclick="disconnectWallet()">Yes</button>
      <button onclick="closePopup()">Cancel</button>
    </div>
  </div>
</div>

<!-- SUCCESS POPUP -->
<div id="successPopup" class="popup">
  <div class="popup-box">
    <p>✅ Agent Created Successfully</p>
    <p id="countdown">Redirecting in 3...</p>
  </div>
</div>
</div>

<script src="vendors/agent.js"></script>

</body>
</html>