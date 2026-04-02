<?php
header("Content-Type: application/json");

// ======================
// DEBUG MODE (ON )
// ======================
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ======================
// DB CONNECT
// ======================
$conn = new mysqli(
    "localhost",
    "",
    "",
    ""
);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "DB Connection Failed",
        "error" => $conn->connect_error
    ]);
    exit;
}

// ======================
// INCLUDE GLOBAL USERNAME CHECK
// ======================
require_once 'check_global_username.php';

// ======================
// GET ACTION
// ======================
$action = $_POST['action'] ?? $_GET['action'] ?? null;
if (!$action) {
    echo json_encode([
        "status" => "error",
        "message" => "No action provided"
    ]);
    exit;
}

// =========================
// CREATE AGENT
// =========================
if ($action === "create_agent") {
    
    // ================= INPUT =================
    $wallet = $_POST['wallet'] ?? null;
    $name = $_POST['name'] ?? null;
    $username = $_POST['username'] ?? null;
    $token_address = $_POST['token_address'] ?? "";

    if (!$wallet || !$name || !$username) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing required fields"
        ]);
        exit;
    }

    $username_clean = strtolower(trim($username));

    // ================= GLOBAL USERNAME CHECK =================
    $check = checkGlobalUsername($conn, $username);
    if ($check['status'] === "error") {
        echo json_encode($check);
        exit;
    }

    // ================= CHECK DUPLICATE  =================
    //

    // ================= IMAGE UPLOAD =================
    $imagePath = "";
    if (isset($_FILES['profile']) && $_FILES['profile']['error'] === 0) {
        $uploadDir = __DIR__ . "/../uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $mime = mime_content_type($_FILES["profile"]["tmp_name"]);
        if (strpos($mime, "image/") !== 0) {
            echo json_encode([
                "status" => "error",
                "message" => "File must be an image",
                "mime" => $mime
            ]);
            exit;
        }

        $ext = explode("/", $mime)[1] ?: "png";
        $fileName = time() . "_" . rand(1000, 9999) . "." . $ext;
        $targetFile = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES["profile"]["tmp_name"], $targetFile)) {
            echo json_encode([
                "status" => "error",
                "message" => "Failed upload image"
            ]);
            exit;
        }
        $imagePath = "uploads/" . $fileName;
    }

    // ================= INSERT =================
    $stmt = $conn->prepare("
        INSERT INTO agents(wallet_address, agent_name, username, token_address, profile_image)
        VALUES(?,?,?,?,?)
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => "Prepare failed",
            "error" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("sssss", $wallet, $name, $username_clean, $token_address, $imagePath);

    if (!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "Insert failed",
            "error" => $stmt->error
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Agent created successfully 🚀",
        "insert_id" => $stmt->insert_id
    ]);
    exit;
}

// =========================
// GET FEED
// =========================
if ($action === "get_feed") {
    $result = $conn->query("
        SELECT
            agent_posts.*,
            agents.username,
            agents.profile_image,
            agents.verify,
            agents.token_address
        FROM agent_posts
        JOIN agents ON agent_posts.agent_id = agents.id
        ORDER BY agent_posts.id DESC
        LIMIT 50
    ");

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => "Query failed",
            "error" => $conn->error
        ]);
        exit;
    }

    $rows = [];
    while ($r = $result->fetch_assoc()) {
        $rows[] = $r;
    }
    echo json_encode($rows);
    exit;
}

// =========================
// DEFAULT
// =========================
echo json_encode([
    "status" => "error",
    "message" => "Invalid action"
]);
?>
