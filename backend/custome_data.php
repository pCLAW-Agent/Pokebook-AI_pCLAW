<?php
header('Content-Type: application/json');

// ======================
// DB CONNECT
// ======================
$conn = new mysqli("localhost","","","");
if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"DB Connection failed"]);
    exit;
}

// ======================
// INCLUDE GLOBAL USERNAME CHECK
// ======================
require_once 'check_global_username.php';

// ======================
// GET INPUT
// ======================
$data = json_decode(file_get_contents("php://input"), true);

// ======================
// VALIDATION
// ======================
if(empty($data['owner_address'])){
    echo json_encode(["status"=>"error","message"=>"Wallet not connected"]);
    exit;
}
if(empty($data['name']) || empty($data['username'])){
    echo json_encode(["status"=>"error","message"=>"Name & Username required"]);
    exit;
}

// ======================
// NORMALIZE
// ======================
$username_clean = strtolower(trim($data['username']));
$token_address = strtolower(trim($data['token'] ?? ""));
$telegram = trim($data['telegram_token'] ?? "");
$platform = trim($data['platform'] ?? "");
$owner = $conn->real_escape_string($data['owner_address']);
$name = $conn->real_escape_string($data['name']);
$username = $conn->real_escape_string($username_clean);
$image = $conn->real_escape_string($data['image'] ?? "");

// ======================
// 🔒 GLOBAL USERNAME CHECK (PAKAI FUNCTION)
// ======================
$check = checkGlobalUsername($conn, $data['username']);
if ($check['status'] === "error") {
    echo json_encode($check);
    exit;
}

// ======================
// LIMIT AGENT PER WALLET
// ======================
$countRes = $conn->query("SELECT COUNT(*) as total FROM super_agents WHERE owner_address='$owner'");
$countRow = $countRes->fetch_assoc();
if($countRow['total'] >= 5){
    echo json_encode(["status"=>"error","message"=>"Max 5 agent per wallet"]);
    exit;
}

// ======================
// 🔒 CHECK TOKEN ADDRESS
// ======================
if(!empty($token_address)){
    $checkToken = $conn->prepare("
        SELECT id FROM super_agents WHERE LOWER(token_address)=?
        UNION
        SELECT id FROM agents WHERE LOWER(token_address)=?
        LIMIT 1
    ");
    $checkToken->bind_param("ss", $token_address, $token_address);
    $checkToken->execute();
    $checkToken->store_result();
    if($checkToken->num_rows > 0){
        echo json_encode(["status"=>"error","message"=>"Token address already used"]);
        exit;
    }
}

// ======================
// 🔒 CHECK TELEGRAM TOKEN (ONLY TELEGRAM)
// ======================
if($platform === "telegram" && !empty($telegram)){
    $checkTele = $conn->prepare("
        SELECT id FROM super_agents
        WHERE telegram_bot_token=?
        LIMIT 1
    ");
    $checkTele->bind_param("s", $telegram);
    $checkTele->execute();
    $checkTele->store_result();
    if($checkTele->num_rows > 0){
        echo json_encode(["status"=>"error","message"=>"Telegram bot token already used"]);
        exit;
    }
}

// ======================
// GENERATE ID
// ======================
$id = uniqid() . "-" . rand(10000,99999);

// ======================
// INSERT DB
// ======================
$sql = "
INSERT INTO super_agents
(id, agent_name, username, token_address, telegram_bot_token, image, platform, owner_address)
VALUES
('$id','$name','$username','$token_address','$telegram','$image','$platform','$owner')
";

if($conn->query($sql)){
    $webhookStatus = "not_set";
    
    // AUTO TELEGRAM WEBHOOK
    if($platform === "telegram" && !empty($telegram)){
        $webhookUrl = "https://pokebookai.com/backend/webhook.php?token=".$telegram;
        $setWebhook = @file_get_contents("https://api.telegram.org/bot$telegram/setWebhook?url=$webhookUrl");
        if($setWebhook !== FALSE){
            $webhookStatus = "active";
        }else{
            $webhookStatus = "failed";
        }
    }
    
    echo json_encode([
        "status"=>"success",
        "message"=>"Agent created 🚀",
        "id"=>$id,
        "webhook"=>$webhookStatus
    ]);
}else{
    echo json_encode([
        "status"=>"error",
        "message"=>"DB Error: ".$conn->error
    ]);
}
?>