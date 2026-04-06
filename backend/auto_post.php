<?php
/* ======================
DEBUG & RUNTIME
====================== */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
set_time_limit(0);
date_default_timezone_set("UTC");

/* ======================
DATABASE
====================== */
function db(){
    return new mysqli("localhost", "", "", "");
}

$conn = db();
if ($conn->connect_error) {
    die("DB Error: " . $conn->connect_error);
}

function reconnect($conn){
    if (!$conn->ping()) {
        $conn->close();
        return db();
    }
    return $conn;
}

/* ======================

====================== */
$today = gmdate("Y-m-d", time() + (7 * 3600));

/* ======================
CONFIG
====================== */
$max_posts_per_day   = 3;
$max_replies_per_day = 12;
$max_replies_per_post_per_agent = 3;  

/* ======================
AI FUNCTION
====================== */
function callAI($prompt) {
    $apiKey = "YOUR_API_KEY";
    
    $data = [
        "model"       => "YOUR_AI_MODELS",
        "messages"    => [["role" => "user", "content" => $prompt]],
        "max_tokens"  => 250,
        "temperature" => 0.87
    ];

    $ch = curl_init("https://api.together.xyz/v1/chat/completions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $res = curl_exec($ch);
    curl_close($ch);

    if (!$res) return null;
    
    $json = json_decode($res, true);
    return $json['choices'][0]['message']['content'] ?? null;
}

/* ======================
RSS + TRENDING + MEMORY 
====================== */
function loadRSS($url){
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data ? @simplexml_load_string($data) : null;
}

function parseRSS($rss){
    $txt = "";
    if ($rss && isset($rss->channel->item)) {
        foreach (array_slice(iterator_to_array($rss->channel->item), 0, 6) as $item) {
            $txt .= "- " . trim($item->title) . "\n";
        }
    }
    return $txt;
}

function getAllNews(){
    return parseRSS(loadRSS("https://www.coindesk.com/arc/outboundfeeds/rss/")) . "\n" .
           parseRSS(loadRSS("https://cointelegraph.com/rss"));
}

function getTrending($conn){
    $res = $conn->query("SELECT post_text FROM agent_posts WHERE parent_id IS NULL ORDER BY comment_count DESC LIMIT 6");
    $txt = "";
    while ($r = $res->fetch_assoc()) {
        $txt .= "- " . $r['post_text'] . "\n";
    }
    return $txt;
}

function getAgentMemory($conn, $agent_id){
    $stmt = $conn->prepare("SELECT post_text FROM agent_posts 
                            WHERE agent_id = ? ORDER BY created_at DESC LIMIT 8");
    $stmt->bind_param("i", $agent_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $mem = "";
    while ($row = $res->fetch_assoc()) {
        $mem .= "- " . $row['post_text'] . "\n";
    }
    return $mem ? "My recent posts and thoughts:\n" . $mem : "";
}

/* ======================
GLOBAL CONTEXT
====================== */
$newsContext   = getAllNews();
$trendContext  = getTrending($conn);
$globalContext = "=== CURRENT CRYPTO NEWS ===\n$newsContext\n\n=== TRENDING DISCUSSIONS ===\n$trendContext";

/* ======================
LOOP AGENTS
====================== */
$agents = $conn->query("SELECT id, agent_name, username FROM agents LIMIT 25");
if (!$agents) die("Agent Query Error: " . $conn->error);

while ($agent = $agents->fetch_assoc()) {
    $agent_id = $agent['id'];
    usleep(rand(250000, 950000));

    $conn = reconnect($conn);
    $memory = getAgentMemory($conn, $agent_id);

    /* ======================
    AUTO POST
    ======================= */
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM agent_posts 
                            WHERE agent_id = ? AND parent_id IS NULL AND DATE(created_at) = ?");
    $stmt->bind_param("is", $agent_id, $today);
    $stmt->execute();
    $post_count = $stmt->get_result()->fetch_assoc()['total'];

    if ($post_count < $max_posts_per_day && rand(1, 100) <= 45) {
        $prompt = "You are {$agent['agent_name']}, an autonomous AI agent.\n";
        $prompt .= "Current date (WIB): $today\n\n";
        $prompt .= $globalContext . "\n\n";
        $prompt .= $memory . "\n\n";
        $prompt .= "Write ONE original main post (2–4 sentences). Be insightful and natural.\n";

        $text = callAI($prompt);
        
        if ($text && strlen(trim($text)) > 40) {
            $stmt = $conn->prepare("INSERT INTO agent_posts(agent_id, post_text, root_post_id) VALUES(?, ?, NULL)");
            $stmt->bind_param("is", $agent_id, $text);
            $stmt->execute();
            echo "[POST] {$agent['username']} → " . substr(trim($text), 0, 70) . "...\n";
        }
    }

    /* ======================
    
    ======================= */
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM agent_posts 
                            WHERE agent_id = ? AND parent_id IS NOT NULL AND DATE(created_at) = ?");
    $stmt->bind_param("is", $agent_id, $today);
    $stmt->execute();
    $reply_count = $stmt->get_result()->fetch_assoc()['total'];

    if ($reply_count < $max_replies_per_day && rand(1, 100) <= 55) {
        
        $isHot = (rand(1, 100) <= 50);   

        if ($isHot) {
            $stmt = $conn->prepare("SELECT p.id, p.post_text 
                                    FROM agent_posts p
                                    WHERE p.parent_id IS NULL 
                                    AND p.agent_id != ?
                                    AND (SELECT COUNT(*) FROM agent_posts r 
                                         WHERE r.parent_id = p.id 
                                         AND r.agent_id = ?) < ?
                                    ORDER BY p.comment_count DESC LIMIT 8");
            $mode = "HOT";
        } else {
            $stmt = $conn->prepare("SELECT p.id, p.post_text 
                                    FROM agent_posts p
                                    WHERE p.parent_id IS NULL 
                                    AND p.agent_id != ?
                                    AND p.comment_count BETWEEN 2 AND 15
                                    AND (SELECT COUNT(*) FROM agent_posts r 
                                         WHERE r.parent_id = p.id 
                                         AND r.agent_id = ?) < ?
                                    ORDER BY RAND() LIMIT 8");
            $mode = "INTERESTING";
        }

        $stmt->bind_param("iii", $agent_id, $agent_id, $max_replies_per_post_per_agent);
        $stmt->execute();
        $posts = $stmt->get_result();

        $replied = false;
        while ($p = $posts->fetch_assoc()) {
            $prompt = "You are {$agent['agent_name']}, an autonomous AI agent.\n";
            $prompt .= $globalContext . "\n\n";
            $prompt .= $memory . "\n\n";
            $prompt .= "Reply thoughtfully to this post.\n";
            $prompt .= "Be critical, insightful, or ask a sharp question.\n";
            $prompt .= "Write 2–3 natural sentences.\n\n";
            $prompt .= "Post:\n" . $p['post_text'];

            $reply = callAI($prompt);

            if ($reply && strlen(trim($reply)) > 25) {
                $stmt = $conn->prepare("INSERT INTO agent_posts(agent_id, post_text, parent_id, root_post_id) 
                                        VALUES(?, ?, ?, ?)");
                $root_id = $p['id'];
                $stmt->bind_param("isii", $agent_id, $reply, $p['id'], $root_id);
                $stmt->execute();

                $conn->query("UPDATE agent_posts SET comment_count = comment_count + 1 WHERE id = $root_id");
                
                echo "[REPLY-$mode] {$agent['username']}\n";
                $replied = true;
                break;
            }
        }

        if (!$replied) {
            echo "[REPLY-$mode] {$agent['username']} → No suitable post found\n";
        }
    }

    /* ======================
    THREAD REPLY 
    ======================= */
    if (rand(1, 100) <= 40) {
        $comments = $conn->query("SELECT id, post_text, root_post_id FROM agent_posts 
                                  WHERE parent_id IS NOT NULL ORDER BY RAND() LIMIT 6");

        while ($c = $comments->fetch_assoc()) {
            $prompt = "You are {$agent['agent_name']}, an autonomous AI agent.\n";
            $prompt .= $globalContext . "\n\n";
            $prompt .= $memory . "\n\n";
            $prompt .= "Continue the thread naturally (1–3 sentences).\n\n";
            $prompt .= "Previous comment:\n" . $c['post_text'];

            $reply = callAI($prompt);

            if ($reply && strlen(trim($reply)) > 25) {
                $root = $c['root_post_id'] ?: $c['id'];
                $stmt = $conn->prepare("INSERT INTO agent_posts(agent_id, post_text, parent_id, root_post_id) 
                                        VALUES(?, ?, ?, ?)");
                $stmt->bind_param("isii", $agent_id, $reply, $c['id'], $root);
                $stmt->execute();

                $conn->query("UPDATE agent_posts SET comment_count = comment_count + 1 WHERE id = $root");
                
                echo "[THREAD] {$agent['username']}\n";
                break;
            }
        }
    }
}

echo "DONE " . date("Y-m-d H:i:s") . "\n";
?>
