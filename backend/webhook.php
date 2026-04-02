<?php
// ======================
// DB CONNECT
// ======================
$conn = new mysqli("localhost", "", "", "");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    exit;
}

// ======================
// GET TOKEN
// ======================
$token = $_GET['token'] ?? '';
if (empty($token)) exit;

// ======================
// FIND AGENT
// ======================
$stmt = $conn->prepare("
    SELECT id, agent_name 
    FROM super_agents 
    WHERE telegram_bot_token = ? 
    LIMIT 1
");
$stmt->bind_param("s", $token);
$stmt->execute();
$res = $stmt->get_result();
$agent = $res->fetch_assoc();

if (!$agent) exit;

$agent_id = $agent['id'];
$agent_name = $agent['agent_name'];

// ======================
// GET TELEGRAM UPDATE
// ======================
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) exit;

$msg = $input["message"] ?? $input["edited_message"] ?? null;
if (!$msg) exit;

// ======================
// 
// ======================
if (isset($msg["from"]["is_bot"]) && $msg["from"]["is_bot"] === true) {
    exit;
}

$chat_id = $msg["chat"]["id"] ?? null;
$text = $msg["text"] ?? "";
$message_id = $msg["message_id"] ?? null;

if (!$chat_id || !$message_id) exit;

// ======================
// TRACK GROUP DATA
// ======================
$chat_type = $msg["chat"]["type"] ?? "private";

if ($chat_type === "group" || $chat_type === "supergroup") {
    $group_title = $msg["chat"]["title"] ?? '';
    $group_username = $msg["chat"]["username"] ?? '';
    $memberCount = 0;

    $resMember = @file_get_contents("https://api.telegram.org/bot$token/getChatMemberCount?chat_id=" . $chat_id);
    $jsonMember = json_decode($resMember, true);
    if (isset($jsonMember["result"])) {
        $memberCount = (int)$jsonMember["result"];
    }

    $stmtGroup = $conn->prepare("
        INSERT INTO agent_telegram_groups 
        (agent_id, chat_id, group_title, group_username, member_count, last_seen)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            group_title = VALUES(group_title),
            group_username = VALUES(group_username),
            member_count = VALUES(member_count),
            last_seen = NOW()
    ");

    $stmtGroup->bind_param("iissi", $agent_id, $chat_id, $group_title, $group_username, $memberCount);
    $stmtGroup->execute();
}

// ======================
// DETECT INTERACTION 
// ======================
$isReplyToBot = isset($msg["reply_to_message"]["from"]["is_bot"]) 
                && $msg["reply_to_message"]["from"]["is_bot"] === true;

$isMention = strpos($text, "@") !== false;

// 
if (($chat_type === "group" || $chat_type === "supergroup") && !$isReplyToBot && !$isMention) {
    exit;
}

// ======================
// CALL AI
// ======================
$ai = file_get_contents("https://pokebookai.com/backend/ai_reply.php", false, stream_context_create([
    "http" => [
        "header" => "Content-Type: application/json",
        "method" => "POST",
        "content" => json_encode([
            "message" => $text,
            "agent_name" => $agent_name
        ])
    ]
]));

$aiData = json_decode($ai, true);
$reply = $aiData['reply'] ?? "Maaf, ada kesalahan saat memproses pesan.";

// ======================
// 🔥 FIXED REPLY TARGET
// ======================
$reply_target = null;

if (isset($msg["reply_to_message"])) {
    $reply_to_msg = $msg["reply_to_message"];

    // 
    $is_replying_to_bot = isset($reply_to_msg["from"]["is_bot"]) 
                          && $reply_to_msg["from"]["is_bot"] === true;

    if ($is_replying_to_bot) {
        // 
        $reply_target = $message_id;
    } else {
        // 
        $reply_target = $reply_to_msg["message_id"] ?? null;
    }
} else {
    // 
    $reply_target = $message_id;
}

// ======================
// SEND MESSAGE TO TELEGRAM
// ======================
$params = [
    "chat_id" => $chat_id,
    "text" => $reply,
    "parse_mode" => "HTML"   
];

if ($reply_target) {
    $params["reply_to_message_id"] = $reply_target;
}

file_get_contents(
    "https://api.telegram.org/bot$token/sendMessage?" . http_build_query($params)
);
?>