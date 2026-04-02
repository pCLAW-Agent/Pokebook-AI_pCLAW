<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost","","","");

if($conn->connect_error){
    echo json_encode(["status"=>"error","message"=>"DB failed"]);
    exit;
}

// ================= GET =================
if($_SERVER['REQUEST_METHOD']=="GET"){

    $wallet = strtolower($conn->real_escape_string($_GET['wallet']));
    $out=[];

    $a = $conn->query("SELECT * FROM agents WHERE LOWER(wallet_address)='$wallet'");
    while($r=$a->fetch_assoc()){
        $r['type']="agent";
        $out[]=$r;
    }

    $b = $conn->query("SELECT * FROM super_agents WHERE LOWER(owner_address)='$wallet'");
    while($r=$b->fetch_assoc()){
        $r['type']="super_agent";
        $out[]=$r;
    }

    echo json_encode($out);
    exit;
}

// ================= EDIT AGENT (UPLOAD) =================
if(isset($_POST['action']) && $_POST['action']=="edit_full" && $_POST['type']=="agent"){

    $id = (int)$_POST['id'];

    $name = $conn->real_escape_string($_POST['agent_name']);
    $username = $conn->real_escape_string($_POST['username']);
    $token = $conn->real_escape_string($_POST['token_address']);

    $imgSQL = "";

    if(isset($_FILES['file']) && $_FILES['file']['error']==0){

        $dir = "../uploads/";
        if(!is_dir($dir)) mkdir($dir,0777,true);

        $fileName = time()."_".rand(1000,9999)."_".$_FILES['file']['name'];
        move_uploaded_file($_FILES['file']['tmp_name'],$dir.$fileName);

        $imgSQL = ", profile_image='uploads/$fileName'";
    }

    $conn->query("
        UPDATE agents SET
        agent_name='$name',
        username='$username',
        token_address='$token'
        $imgSQL
        WHERE id=$id
    ");

    echo json_encode(["status"=>"updated"]);
    exit;
}

// ================= HANDLE JSON =================
$data = json_decode(file_get_contents("php://input"), true);

// ================= EDIT SUPER AGENT =================
if($data['action']=="edit_full" && $data['type']=="super_agent"){

    $id = $conn->real_escape_string($data['id']);

    // 
    $old = $conn->query("SELECT platform FROM super_agents WHERE id='$id'")->fetch_assoc();

    $platform = $old['platform']; // LOCKED

    $name = $conn->real_escape_string($data['agent_name']);
    $username = $conn->real_escape_string($data['username']);
    $token = $conn->real_escape_string($data['token_address']);
    $image = $conn->real_escape_string($data['image']);

    // 
    $telegram = "";
    if($platform === "telegram"){
        $telegram = $conn->real_escape_string($data['telegram_bot_token'] ?? "");
    }

    $conn->query("
        UPDATE super_agents SET
        agent_name='$name',
        username='$username',
        token_address='$token',
        image='$image',
        telegram_bot_token='$telegram'
        WHERE id='$id'
    ");

    // AUTO UPDATE WEBHOOK
    if($platform === "telegram" && !empty($telegram)){
        $webhook = "https://pokebookai.com/backend/webhook.php?token=".$telegram;
        @file_get_contents("https://api.telegram.org/bot$telegram/setWebhook?url=$webhook");
    }

    echo json_encode(["status"=>"updated"]);
    exit;
}

// ================= DELETE =================
if($data['action']=="delete"){

    if($data['type']=="agent"){
        $conn->query("DELETE FROM agents WHERE id=".(int)$data['id']);
    } else {
        $conn->query("DELETE FROM super_agents WHERE id='".$conn->real_escape_string($data['id'])."'");
    }

    echo json_encode(["status"=>"deleted"]);
    exit;
}