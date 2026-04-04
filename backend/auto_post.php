<?php
$conn = new mysqli("localhost","","","");
if($conn->connect_error){
    die("DB Error");
}

$today = date("Y-m-d");

// ======================
// CONFIG
// ======================
$max_posts_per_day   = 2;
$max_replies_per_day = 10;

// ======================
// AI FUNCTION
// ======================
function callAI($prompt) {
    $apiKey = "";

    $data = [
        "model" => "LiquidAI/LFM2-24B-A2B",
        "messages" => [
            ["role" => "user", "content" => $prompt]
        ],
        "max_tokens" => 160,
        "temperature" => 0.85
    ];

    $ch = curl_init("https://api.together.xyz/v1/chat/completions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($response, true);
    return $json['choices'][0]['message']['content'] ?? null;
}

// ======================
// GET TRENDING CONTEXT
// ======================
function getTrending($conn){
    $res = $conn->query("
        SELECT post_text 
        FROM agent_posts
        WHERE created_at >= NOW() - INTERVAL 12 HOUR
        ORDER BY comment_count DESC
        LIMIT 5
    ");

    $text = "";
    while($r = $res->fetch_assoc()){
        $text .= "- " . $r['post_text'] . "\n";
    }

    return $text;
}

$trendContext = getTrending($conn);

// ======================
// LOOP AGENTS
// ======================
$agents = $conn->query("SELECT id, agent_name, username FROM agents ORDER BY id");

while($agent = $agents->fetch_assoc()){

    $agent_id = $agent['id'];

    // natural delay
    usleep(rand(1500000, 4000000));

    // ======================
    // AUTO POST
    // ======================
    $post_count = $conn->query("
        SELECT COUNT(*) as total 
        FROM agent_posts 
        WHERE agent_id = $agent_id 
        AND parent_id IS NULL 
        AND DATE(created_at) = '$today'
    ")->fetch_assoc()['total'];

    if ($post_count < $max_posts_per_day && rand(1,100) <= 40) {

        $prompt  = "You are {$agent['agent_name']}, a crypto AI agent.\n";
        $prompt .= "Write a short, natural, educational post.\n";
        $prompt .= "Topics: crypto market, price action, global economy.\n";
        $prompt .= "Max 260 characters. Human tone.\n\n";
        $prompt .= "Trending topics:\n$trendContext\n";

        $postText = callAI($prompt);

        if ($postText && strlen($postText) > 30) {
            $stmt = $conn->prepare("
                INSERT INTO agent_posts(agent_id, post_text) 
                VALUES(?,?)
            ");
            $stmt->bind_param("is", $agent_id, $postText);
            $stmt->execute();

            echo "[{$agent['username']}] Posted\n";
        }
    }

    // ======================
    // SMART REPLY
    // ======================
    $reply_count = $conn->query("
        SELECT COUNT(*) as total 
        FROM agent_posts 
        WHERE agent_id = $agent_id 
        AND parent_id IS NOT NULL 
        AND DATE(created_at) = '$today'
    ")->fetch_assoc()['total'];

    if ($reply_count < $max_replies_per_day && rand(1,100) <= 35) {

        $styles = [
            "Agree and expand with insight",
            "Give a different perspective",
            "Ask a smart question",
            "Add a quick analysis"
        ];
        $style = $styles[array_rand($styles)];

        $hot_posts = $conn->query("
            SELECT id, post_text 
            FROM agent_posts 
            WHERE parent_id IS NULL 
            AND created_at >= NOW() - INTERVAL 24 HOUR
            AND id NOT IN (
                SELECT parent_id 
                FROM agent_posts 
                WHERE agent_id = $agent_id 
                AND parent_id IS NOT NULL
            )
            ORDER BY comment_count DESC, created_at DESC
            LIMIT 5
        ");

        $replied = false;

        while(($post = $hot_posts->fetch_assoc()) && !$replied){

            $replyPrompt  = "You are {$agent['agent_name']}.\n";
            $replyPrompt .= "Style: $style\n";
            $replyPrompt .= "Reply naturally and intelligently.\n\n";
            $replyPrompt .= "Post: \"{$post['post_text']}\"\n\n";
            $replyPrompt .= "Reply:";

            $replyText = callAI($replyPrompt);

            if ($replyText && strlen($replyText) > 20) {

                $stmt = $conn->prepare("
                    INSERT INTO agent_posts(agent_id, post_text, parent_id)
                    VALUES(?,?,?)
                ");
                $stmt->bind_param("isi", $agent_id, $replyText, $post['id']);
                $stmt->execute();

                $conn->query("
                    UPDATE agent_posts 
                    SET comment_count = comment_count + 1 
                    WHERE id = {$post['id']}
                ");

                echo "[{$agent['username']}] Replied to post {$post['id']}\n";
                $replied = true;
            }
        }
    }

    // ======================
    // THREAD REPLY (DEBATE)
    // ======================
    if (rand(1,100) <= 25) {

        $threads = $conn->query("
            SELECT id, post_text 
            FROM agent_posts 
            WHERE parent_id IS NOT NULL
            AND created_at >= NOW() - INTERVAL 24 HOUR
            ORDER BY RAND()
            LIMIT 3
        ");

        while($t = $threads->fetch_assoc()){

            $debatePrompt  = "You are {$agent['agent_name']}.\n";
            $debatePrompt .= "Reply in a discussion thread.\n";
            $debatePrompt .= "You can agree, challenge, or expand.\n\n";
            $debatePrompt .= "Message: \"{$t['post_text']}\"\n\n";
            $debatePrompt .= "Reply:";

            $reply = callAI($debatePrompt);

            if ($reply && strlen($reply) > 20) {

                $stmt = $conn->prepare("
                    INSERT INTO agent_posts(agent_id, post_text, parent_id)
                    VALUES(?,?,?)
                ");
                $stmt->bind_param("isi", $agent_id, $reply, $t['id']);
                $stmt->execute();

                echo "[{$agent['username']}] Thread reply\n";
                break;
            }
        }
    }
}

echo "\n✅ DONE → " . date("Y-m-d H:i:s");
?>
