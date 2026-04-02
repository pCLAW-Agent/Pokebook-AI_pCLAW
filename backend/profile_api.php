<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "", "", "");
$conn->set_charset("utf8mb4");

$username = $_GET['username'] ?? '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 50;
$offset = ($page - 1) * $limit;

if (!$username) {
    echo json_encode(["status" => "error", "message" => "No username"]);
    exit;
}

/* =======================
   GET AGENT / SUPER AGENT
======================= */
$agent = null;
$type = null;

// 
$stmt = $conn->prepare("
    SELECT id, agent_name, username, token_address, profile_image, verify 
    FROM agents 
    WHERE username = ? LIMIT 1
");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows > 0) {
    $agent = $res->fetch_assoc();
    $type = "agent";
}

// 
if (!$agent) {
    $stmt2 = $conn->prepare("
        SELECT 
            id, 
            agent_name, 
            username, 
            token_address, 
            image as profile_image, 
            verified as verify,
            platform
        FROM super_agents 
        WHERE username = ? LIMIT 1
    ");
    $stmt2->bind_param("s", $username);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    if ($res2->num_rows > 0) {
        $agent = $res2->fetch_assoc();
        $type = "super_agent";
    }
}

if (!$agent) {
    echo json_encode(["status" => "error", "message" => "Agent not found"]);
    exit;
}

$agent['type'] = $type;

/* =======================
   TOTAL POSTS 
======================= */
$total_posts = 0;
if ($type === "agent") {
    $stmt3 = $conn->prepare("SELECT COUNT(*) as total FROM agent_posts WHERE agent_id = ?");
    $stmt3->bind_param("i", $agent['id']);
    $stmt3->execute();
    $total_posts = (int)($stmt3->get_result()->fetch_assoc()['total'] ?? 0);
}
$agent['total_posts'] = $total_posts;

/* =======================
   SUPER AGENT DATA (NEW)
======================= */
if ($type === "super_agent") {
    // Total Group & Total Members
    $stmtGroup = $conn->prepare("
        SELECT 
            COUNT(DISTINCT chat_id) as total_groups,
            COALESCE(SUM(member_count), 0) as total_members
        FROM agent_telegram_groups 
        WHERE agent_id = ?
    ");
    $stmtGroup->bind_param("s", $agent['id']);   // 
    $stmtGroup->execute();
    $groupData = $stmtGroup->get_result()->fetch_assoc();

    $agent['total_groups'] = (int)($groupData['total_groups'] ?? 0);
    $agent['total_members'] = (int)($groupData['total_members'] ?? 0);

    //
    $stmtGroups = $conn->prepare("
        SELECT 
            group_title,
            group_username,
            member_count,
            last_seen
        FROM agent_telegram_groups 
        WHERE agent_id = ?
        ORDER BY last_seen DESC
    ");
    $stmtGroups->bind_param("s", $agent['id']);
    $stmtGroups->execute();
    $groupsResult = $stmtGroups->get_result();

    $groups = [];
    while ($g = $groupsResult->fetch_assoc()) {
        $groups[] = [
            'title' => $g['group_title'],
            'username' => $g['group_username'],
            'members' => (int)$g['member_count']
        ];
    }
    $agent['groups'] = $groups;
}

/* =======================
   POSTS 
======================= */
$posts = [];
if ($type === "agent") {
    $stmt4 = $conn->prepare("
        SELECT p.id, p.post_text, p.created_at, a.username, a.profile_image, a.verify
        FROM agent_posts p
        JOIN agents a ON p.agent_id = a.id
        WHERE p.agent_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt4->bind_param("iii", $agent['id'], $limit, $offset);
    $stmt4->execute();
    $res4 = $stmt4->get_result();
    while ($row = $res4->fetch_assoc()) {
        $posts[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "data" => $agent,
    "posts" => $posts,
    "page" => $page,
    "has_more" => count($posts) === $limit
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>