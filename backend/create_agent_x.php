<?php
header('Content-Type: application/json');

// ======================
// DATABASE CONNECTION
// ======================
$conn = new mysqli("localhost", "", "", "");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection failed"]);
    exit;
}

// Include global username checker
require_once 'check_global_username.php';

// ======================
// GET INPUT DATA
// ======================
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['owner_address']) || empty($data['name']) || empty($data['username'])) {
    echo json_encode(["status" => "error", "message" => "Wallet, name and username are required"]);
    exit;
}

// ======================
// SANITIZE INPUT
// ======================
$owner           = $conn->real_escape_string($data['owner_address']);
$name            = $conn->real_escape_string($data['name']);
$username        = $conn->real_escape_string(strtolower(trim($data['username'])));
$image           = $conn->real_escape_string($data['image'] ?? '');
$token_address   = $conn->real_escape_string($data['token'] ?? '');
$x_user_id       = $conn->real_escape_string($data['x_user_id'] ?? '');
$x_screen_name   = $conn->real_escape_string($data['x_screen_name'] ?? '');
$x_access_token  = $conn->real_escape_string($data['x_access_token'] ?? '');
$x_access_secret = $conn->real_escape_string($data['x_access_secret'] ?? '');

// ======================
// GLOBAL USERNAME CHECK
// ======================
$check = checkGlobalUsername($conn, $data['username']);
if ($check['status'] === "error") {
    echo json_encode($check);
    exit;
}

// ======================
// VALIDASI X DATA
// ======================
if (empty($x_user_id) || empty($x_screen_name) || empty($x_access_token) || empty($x_access_secret)) {
    echo json_encode(["status" => "error", "message" => "X Account not connected properly"]);
    exit;
}

// ======================
// LIMIT: Max 5 agents per wallet
// ======================
$countRes = $conn->query("SELECT COUNT(*) as total FROM super_agents WHERE owner_address = '$owner'");
if ($countRes->fetch_assoc()['total'] >= 5) {
    echo json_encode(["status" => "error", "message" => "Maximum 5 agents per wallet"]);
    exit;
}

// ======================
// GENERATE UNIQUE ID
// ======================
$id = uniqid() . "-" . rand(10000, 99999);

// ======================
// INSERT INTO super_agents
// ======================
$sql = "INSERT INTO super_agents 
        (id, agent_name, username, token_address, image, platform, owner_address, created_at)
        VALUES 
        ('$id', '$name', '$username', '$token_address', '$image', 'x', '$owner', NOW())";

if (!$conn->query($sql)) {
    echo json_encode(["status" => "error", "message" => "DB Error: " . $conn->error]);
    exit;
}

// ======================
// INSERT INTO super_agents_x
// ======================
$x_sql = "INSERT INTO super_agents_x 
          (id, agent_id, x_user_id, x_screen_name, 
           x_access_token, x_refresh_token, x_connected_at)
          VALUES 
          ('$id', '$id', '$x_user_id', '$x_screen_name', 
           '$x_access_token', '$x_access_secret', NOW())";

if (!$conn->query($x_sql)) {
    echo json_encode(["status" => "error", "message" => "Failed to save X credentials"]);
    exit;
}

echo json_encode([
    "status"  => "success",
    "message" => "X Agent created successfully 🚀",
    "id"      => $id,
    "x_handle"=> "@" . $x_screen_name
]);
?>