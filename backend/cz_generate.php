<?php
header('Content-Type: application/json');

// ======================
// DB CONNECT
// ======================
$conn = new mysqli("localhost", "", "", "");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB failed"]);
    exit;
}

// ======================
// API CONFIG
// ======================
$apiKey = "YOUR_API";

// ======================
// GET INPUT
// ======================
$data = json_decode(file_get_contents("php://input"), true);
$tweet = trim($data['tweet'] ?? '');
$link  = trim($data['link'] ?? '');

if (empty($tweet)) {
    echo json_encode(["status" => "error", "message" => "Empty tweet"]);
    exit;
}

// ======================
// 
// ======================
$prompt = "
You are explaining CZ's tweet in simple  using clear English.

Tweet from CZ:
\"{$tweet}\"

Respond exactly in this format and nothing else:

Insight: Explain clearly what CZ is saying in this tweet.

Impact: Explain the bad consequences or risks if someone ignores this advice from CZ.

Use short sentences and easy words. Do not add any other text.
";

// ======================
// CALL AI
// ======================
$url = "https://api.together.xyz/v1/chat/completions";

$payload = [
    "model" => "google/gemma-3n-E4B-it",
    "messages" => [
        [
            "role" => "system",
            "content" => "Always answer with exactly two sections only:\nInsight: [penjelasan tweet]\nImpact: [dampak buruk jika diabaikan]\nUse simple and clear English. No extra words."
        ],
        [
            "role" => "user",
            "content" => $prompt
        ]
    ],
    "max_tokens" => 280,
    "temperature" => 0.7
];

$options = [
    "http" => [
        "header"  => "Content-Type: application/json\r\nAuthorization: Bearer $apiKey",
        "method"  => "POST",
        "content" => json_encode($payload),
        "timeout" => 35
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    echo json_encode(["status" => "error", "message" => "AI request failed"]);
    exit;
}

$result = json_decode($response, true);
$aiText = $result['choices'][0]['message']['content'] ?? "";

// ======================
// PARSING
// ======================
$insight = "Could not explain the tweet.";
$impact  = "Could not generate impact.";

if (preg_match('/Insight\s*:\s*(.*?)(?=Impact\s*:|$)/is', $aiText, $m)) {
    $insight = trim($m[1]);
}
if (preg_match('/Impact\s*:\s*(.*)/is', $aiText, $m)) {
    $impact = trim($m[1]);
}

// Fallback 
if (strlen($insight) < 40) {
    $insight = "CZ warns that most people who claim they can help list your project on Binance are scammers.";
}

if (strlen($impact) < 30) {
    $impact = "If you believe them and pay money, you will likely lose your money to scammers.";
}

// ======================
// SAVE TO DATABASE
// ======================
$stmt = $conn->prepare("INSERT INTO cz_archive (tweet_text, tweet_link, insight, impact) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $tweet, $link, $insight, $impact);
$stmt->execute();

echo json_encode([
    "status"  => "success",
    "insight" => $insight,
    "impact"  => $impact
]);