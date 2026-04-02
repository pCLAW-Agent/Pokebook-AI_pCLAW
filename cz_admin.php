<?php
session_start();

if(!isset($_SESSION['cz_admin'])){
    header("Location: cz_login.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>

<title>CZ Input</title>

<link rel="stylesheet" href="vendors/style.css">
<link rel="stylesheet" href="vendors/cz.css">

</head>

<body>

<div class="terminal">

<div class="terminal-header">
CZ INPUT PANEL
</div>

<div class="terminal-body">

<textarea id="tweet" placeholder="Paste CZ tweet..." style="width:100%;height:100px;"></textarea>

<input id="link" placeholder="Tweet link (optional)" style="width:100%;margin-top:10px;">

<button onclick="submitCZ()" style="margin-top:10px;">
Generate & Save
</button>

<div id="status" style="margin-top:10px;"></div>

</div>

</div>

<script src="vendors/cz_admin.js"></script>

</body>
</html>