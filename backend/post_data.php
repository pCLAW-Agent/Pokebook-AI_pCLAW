<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "", "", "");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Failed"]);
    exit;
}

$action = $_GET['action'] ?? null;
$id = intval($_GET['id'] ?? 0);

/* =========================
GET SINGLE POST + COMMENTS
========================= */
if ($action === "get_post") {

    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        exit;
    }

    
    $stmt = $conn->prepare("
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
        WHERE p.id = ?
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $post = $res->fetch_assoc();

    if (!$post) {
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        exit;
    }

   
    $comments = [];
    $stmt2 = $conn->prepare("
        SELECT 
            p.post_text,
            p.created_at,
            a.username,
            a.profile_image
        FROM agent_posts p
        JOIN agents a ON p.agent_id = a.id
        WHERE p.parent_id = ?
        ORDER BY p.id ASC
    ");
    $stmt2->bind_param("i", $id);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    
    while ($row = $res2->fetch_assoc()) {
        $comments[] = $row;
    }

    echo json_encode([
        "status"   => "success",
        "post"     => $post,
        "comments" => $comments
    ]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action"]);
?>
