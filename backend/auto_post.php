<?php
ini_set('display_errors',1);
error_reporting(E_ALL);
set_time_limit(0);
date_default_timezone_set("UTC");

/* ======================
DB
====================== */
function db(){
    return new mysqli("localhost","user","pw","db");
}
$conn = db();

/* ======================
CONFIG
====================== */
$today = gmdate("Y-m-d", time() + (7*3600));
$max_posts_per_day = 3;


$finnhub_api_key = "Key";
$newsdata_api_key = "Key";   

/* ======================
FETCH NEWS - Rotasi Finnhub + NewsData.io
====================== */
function getNews(){
    global $finnhub_api_key, $newsdata_api_key;

    
    if (rand(0,1) === 0) {
   
        $url = "https://finnhub.io/api/v1/news?category=general&token=" . $finnhub_api_key;
    } else {
        
        $url = "https://newsdata.io/api/1/news?apikey=" . $newsdata_api_key . "&category=business,technology&language=en";
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15
    ]);
    $res = curl_exec($ch);
    curl_close($ch);

    if(!$res) return [];

    $json = json_decode($res, true);

  
    if (isset($json['articles'])) {
        // NewsData.io format
        return array_map(function($item){
            return [
                'id' => $item['article_id'] ?? md5($item['title']),
                'headline' => $item['title'],
                'summary' => $item['description'] ?? $item['title'],
                'source' => $item['source_id'] ?? 'NewsData'
            ];
        }, $json['articles']);
    } else {
        // Finnhub format
        return array_map(function($item){
            return [
                'id' => $item['id'] ?? md5($item['headline']),
                'headline' => $item['headline'],
                'summary' => $item['summary'] ?? $item['headline'],
                'source' => $item['source'] ?? 'Finnhub'
            ];
        }, $json);
    }
}

/* ======================
MARK NEWS AS USED
====================== */
function markNewsAsUsed($conn, $newsId, $agentId){
    $stmt = $conn->prepare("INSERT IGNORE INTO used_news (news_id, agent_id, used_at) VALUES(?, ?, NOW())");
    $stmt->bind_param("si", $newsId, $agentId);
    $stmt->execute();
}

function isNewsUsed($conn, $newsId){
    $stmt = $conn->prepare("SELECT 1 FROM used_news WHERE news_id = ? LIMIT 1");
    $stmt->bind_param("s", $newsId);
    $stmt->execute();
    return $stmt->get_result()->num_rows > 0;
}

/* ======================

====================== */
function generateInsight($agentName, $news){
    $apiKey = "Key";

    $prompt = "
You are {$agentName}, a sharp, experienced, and critical crypto trader.

News:
Title: {$news['headline']}
Summary: {$news['summary']}

Write a critical and analytical comment (2-4 sentences) about this news.
Requirements:
- Be honest and critical (can be bullish, bearish, or skeptical)
- Include clear cause and effect (sebab-akibat)
- Explain why this news matters for the crypto market or broader economy
- Give your personal opinion as a trader
- Sound natural like a real human trader on Twitter/X

Your critical insight:
";

    $data = [
        "model"       => "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "messages"    => [["role" => "user", "content" => $prompt]],
        "temperature" => 0.75,
        "max_tokens"  => 140
    ];

    $ch = curl_init("https://api.together.xyz/v1/chat/completions");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer $apiKey", "Content-Type: application/json"],
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_TIMEOUT => 25
    ]);

    $res = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($res, true);
    return $json['choices'][0]['message']['content'] ?? null;
}

/* ======================
CLEAN OUTPUT
====================== */
function cleanOutput($text){
    $text = trim($text);
    $text = preg_replace('/[\x{1F000}-\x{1FFFF}]/u', '', $text);
    $text = preg_replace('/^["\']|["\']$/', '', $text);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

/* ======================
MAIN
====================== */

echo "=== AGENT NEWS SYSTEM STARTED (KRITIS + VARIATIF) ===\n";

$agents = $conn->query("SELECT id, agent_name FROM agents ORDER BY RAND()");

$newsList = getNews();
if(empty($newsList)){
    echo "No news available from sources.\n";
    exit;
}

$usedNewsToday = [];

while($agent = $agents->fetch_assoc()){

    echo "\n[AGENT] {$agent['agent_name']}\n";

   
    $q = $conn->query("SELECT COUNT(*) as c FROM agent_posts 
                       WHERE agent_id = {$agent['id']} AND DATE(created_at) = '$today'");
    if($q->fetch_assoc()['c'] >= $max_posts_per_day){
        echo "[LIMIT REACHED TODAY]\n";
        continue;
    }

   
    $selectedNews = null;
    foreach($newsList as $news){
        $newsId = $news['id'] ?? md5($news['headline'] . ($news['datetime'] ?? ''));

        if(!isset($usedNewsToday[$newsId]) && !isNewsUsed($conn, $newsId)){
            $selectedNews = $news;
            $usedNewsToday[$newsId] = true;
            break;
        }
    }

    if(!$selectedNews){
        echo "[NO AVAILABLE NEWS - SKIP]\n";
        continue;
    }

    $insight = generateInsight($agent['agent_name'], $selectedNews);

    if(!$insight){
        echo "[AI FAILED]\n";
        continue;
    }

    $insight = cleanOutput($insight);

   
    $stmt = $conn->prepare("INSERT INTO agent_posts (agent_id, post_text, confidence, is_viral, source_news_id) 
                            VALUES(?,?,?,?,?)");
    $confidence = 78;
    $isViral = 0;
    $newsId = $selectedNews['id'] ?? md5($selectedNews['headline']);

    $stmt->bind_param("isisi", $agent['id'], $insight, $confidence, $isViral, $newsId);
    $stmt->execute();

    echo "[POSTED] → $insight\n";

   
    markNewsAsUsed($conn, $newsId, $agent['id']);
}

echo "\n=== DONE ===\n";
