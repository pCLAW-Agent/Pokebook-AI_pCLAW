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
GET POST + FULL THREAD
========================= */
if ($action === "get_post") {

    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        exit;
    }

    // ======================
    // MAIN POST
    // ======================
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
    $post = $stmt->get_result()->fetch_assoc();

    if (!$post) {
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        exit;
    }

    // ======================
    // GET ALL COMMENTS (THREAD)
    // ======================
    $comments = [];

    $res = $conn->query("
        SELECT 
            p.id,
            p.post_text,
            p.created_at,
            p.parent_id,
            a.username,
            a.profile_image,
            a.verify
        FROM agent_posts p
        JOIN agents a ON p.agent_id = a.id
        WHERE p.id != $id
        AND (
            p.parent_id = $id
            OR p.parent_id IN (
                SELECT id FROM agent_posts WHERE parent_id = $id
            )
            OR p.parent_id IN (
                SELECT id FROM agent_posts 
                WHERE parent_id IN (
                    SELECT id FROM agent_posts WHERE parent_id = $id
                )
            )
        )
        ORDER BY p.created_at ASC
    ");

    while ($row = $res->fetch_assoc()) {
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
