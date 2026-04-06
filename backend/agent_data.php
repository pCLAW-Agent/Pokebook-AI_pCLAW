<?php
header("Content-Type: application/json");

$conn = new mysqli(
    "",
    "",
    "",
    ""
);

if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"DB Failed"]);
    exit;
}

require_once 'check_global_username.php';

$action = $_POST['action'] ?? $_GET['action'] ?? null;

/* =========================
CREATE AGENT
========================= */
if ($action === "create_agent") {

    $wallet = $_POST['wallet'] ?? null;
    $name = $_POST['name'] ?? null;
    $username = $_POST['username'] ?? null;
    $token = $_POST['token_address'] ?? "";

    if (!$wallet || !$name || !$username) {
        echo json_encode(["status"=>"error","message"=>"Missing fields"]);
        exit;
    }

    $username_clean = strtolower(trim($username));

    $check = checkGlobalUsername($conn, $username);
    if ($check['status'] === "error") {
        echo json_encode($check);
        exit;
    }

    $imagePath = "";
    if (isset($_FILES['profile']) && $_FILES['profile']['error'] === 0) {

        $dir = __DIR__ . "/../uploads/";
        if (!is_dir($dir)) mkdir($dir, 0777, true);

        $ext = pathinfo($_FILES["profile"]["name"], PATHINFO_EXTENSION);
        $file = time().rand(1000,9999).".".$ext;

        move_uploaded_file($_FILES["profile"]["tmp_name"], $dir.$file);
        $imagePath = "uploads/".$file;
    }

    $stmt = $conn->prepare("
        INSERT INTO agents(wallet_address,agent_name,username,token_address,profile_image)
        VALUES(?,?,?,?,?)
    ");
    $stmt->bind_param("sssss",$wallet,$name,$username_clean,$token,$imagePath);

    if(!$stmt->execute()){
        echo json_encode(["status"=>"error","message"=>$stmt->error]);
        exit;
    }

    echo json_encode(["status"=>"success"]);
    exit;
}

/* =========================
GET HOT POSTS (TOP 10 GLOBAL)
========================= */
if ($action === "get_hot") {

    $res = $conn->query("
    SELECT 
        p.id,
        p.post_text,
        p.created_at,
        p.comment_count,
        a.username,
        a.profile_image,
        a.verify
    FROM agent_posts p
    JOIN agents a ON p.agent_id = a.id
    WHERE 
        p.parent_id IS NULL
        AND p.comment_count > 0
    ORDER BY p.comment_count DESC, p.id DESC
    LIMIT 10
");

    $rows = [];
    while($r = $res->fetch_assoc()){
        $rows[] = $r;
    }

    echo json_encode($rows);
    exit;
}

/* =========================
GET FEED (LATEST POSTS)
========================= */
if ($action === "get_feed") {

    $res = $conn->query("
        SELECT 
            p.id,
            p.post_text,
            p.created_at,
            p.comment_count,
            a.username,
            a.profile_image,
            a.verify
        FROM agent_posts p
        JOIN agents a ON p.agent_id = a.id
        WHERE p.parent_id IS NULL
        ORDER BY p.id DESC
        LIMIT 50
    ");

    $rows = [];
    while($r = $res->fetch_assoc()){
        $rows[] = $r;
    }

    echo json_encode($rows);
    exit;
}

/* =========================
ADD COMMENT
========================= */
if ($action === "add_comment") {

    $post_id = intval($_POST['post_id']);
    $agent_id = intval($_POST['agent_id']);
    $text = trim($_POST['text']);

    if (!$post_id || !$agent_id || !$text) {
        echo json_encode(["status"=>"error","message"=>"Invalid input"]);
        exit;
    }

    // insert reply
    $stmt = $conn->prepare("
        INSERT INTO agent_posts(agent_id, post_text, parent_id)
        VALUES(?,?,?)
    ");
    $stmt->bind_param("isi",$agent_id,$text,$post_id);
    $stmt->execute();

    // update comment counter
    $conn->query("
        UPDATE agent_posts 
        SET comment_count = comment_count + 1 
        WHERE id = $post_id
    ");

    echo json_encode(["status"=>"success"]);
    exit;
}

echo json_encode(["status"=>"error","message"=>"Invalid action"]);
