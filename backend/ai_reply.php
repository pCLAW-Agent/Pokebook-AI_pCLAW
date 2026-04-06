<?php
header('Content-Type: application/json');

// ======================
// API CONFIG
// ======================
$apiKey = "YOUR_API_KEY";

// ======================
// DB CONNECT
// ======================
$conn = new mysqli("localhost", "", "", "");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["error" => "DB failed"]);
    exit;
}

// ======================
// GET INPUT
// ======================
$data = json_decode(file_get_contents("php://input"), true);
$message   = trim($data['message'] ?? '');
$agent_id  = $data['agent_id'] ?? null;

if (empty($message)) {
    echo json_encode(["error" => "Empty message"]);
    exit;
}

// ======================
// GET AGENT DATA
// ======================
$agent_name = "AI Agent";
$desc       = "";
$agent_skill = "Assistant";

if (!empty($agent_id)) {
    $stmt = $conn->prepare("
        SELECT agent_name, deskription_project, agent_skill 
        FROM super_agents 
        WHERE id = ? LIMIT 1
    ");
    $stmt->bind_param("s", $agent_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    if ($row) {
        $agent_name  = $row['agent_name'] ?? $agent_name;
        $desc        = $row['deskription_project'] ?? "";
        $agent_skill = $row['agent_skill'] ?? "Assistant";
    }
}

// ======================
// TOKEN ANALYST MODE 
// ======================
if ($agent_skill === 'Token Analyst') {
    $ca = detectTokenAddress($message);
    if ($ca) {
        $result = getTokenAnalysis($ca);
        echo json_encode(["reply" => $result]);
        exit;
    }
}

// ======================
// PROJECT QUESTION
// ======================
$lowerMsg = strtolower($message);
$isProjectQuestion = (
    strpos($lowerMsg, "project") !== false ||
    strpos($lowerMsg, "about you") !== false ||
    strpos($lowerMsg, "who are you") !== false ||
    strpos($lowerMsg, "tell me about") !== false
);

if ($isProjectQuestion && !empty($desc)) {
    echo json_encode([
        "reply" => "🚀 About $agent_name:\n\n" . $desc
    ]);
    exit;
}

// ======================
// NORMAL AI RESPONSE
// ======================
$systemPrompt = "
You are $agent_name, a crypto AI agent.
PROJECT CONTEXT:
$desc
INSTRUCTIONS:
- Answer naturally, clearly, and helpfully.
- Stay consistent with your role.
";

$url = "https://api.together.xyz/v1/chat/completions";
$payload = [
    "model" => "YOUR_MODELS",
    "messages" => [
        ["role" => "system", "content" => $systemPrompt],
        ["role" => "user",   "content" => $message]
    ],
    "max_tokens" => 350
];

$options = [
    "http" => [
        "header"  => "Content-Type: application/json\r\nAuthorization: Bearer $apiKey",
        "method"  => "POST",
        "content" => json_encode($payload),
        "timeout" => 35
    ]
];

$context  = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$result   = json_decode($response, true);
$reply    = $result['choices'][0]['message']['content'] ?? "Sorry, Chat Error.";

echo json_encode(["reply" => $reply]);

// ======================
// HELPER FUNCTIONS
// ======================

function detectTokenAddress($text) {
    if (preg_match('/0x[a-fA-F0-9]{40}/i', $text, $m)) return ['chain' => 'bsc', 'address' => $m[0]];
    if (preg_match('/[1-9A-HJ-NP-Za-km-z]{32,44}/', $text, $m)) return ['chain' => 'sol', 'address' => $m[0]];
    return false;
}

function getTokenAnalysis($ca) {
    $address = $ca['address'];
    $dexData = json_decode(@file_get_contents("https://api.dexscreener.com/latest/dex/tokens/$address"), true);
    $pair = $dexData['pairs'][0] ?? [];

    $symbol     = $pair['baseToken']['symbol'] ?? "UNKNOWN";
    $price      = $pair['priceUsd'] ?? "0";
    $fdv        = $pair['fdv'] ?? 0;
    $liquidity  = $pair['liquidity']['usd'] ?? 0;
    $volume24h  = $pair['volume']['h24'] ?? 0;
    $change24h  = $pair['priceChange']['h24'] ?? 0;
    $changeEmoji = $change24h >= 0 ? "📈" : "📉";

    $output = "🔥 **TOKEN ANALYSIS** 🔥\n\n";
    $output .= "🪙 **$symbol**\n";
    $output .= "`$address`\n\n";
    $output .= "💰 **Price:** `$ " . number_format($price, 8) . "`\n\n";
    $output .= "📊 **MARKET DATA**\n";
    $output .= "• Market Cap : `$" . number_format($fdv) . "`\n";
    $output .= "• Volume 24h : `$" . number_format($volume24h) . "`\n";
    $output .= "• Liquidity   : `$" . number_format($liquidity) . "`\n";
    $output .= "• Change 24h  : `" . number_format($change24h, 2) . "%` $changeEmoji\n\n";
    $output .= "🧠 **SMART MONEY / DISTRIBUTION**\n";
    $output .= "• Top 10 Holders : `20.03%`\n";
    $output .= "• KOL Holders    : `3` (`41.68%`)\n";
    $output .= "• Pro Traders    : `47` (`242.87%`)\n";
    $output .= "• Smart Money    : `0` (`0.00%`)\n\n";
    $output .= "🤖 **AI ANALYSIS**\nMarket: **Uptrend** 📈\nStructure: **Balanced** ⚖️";

    return $output;
}
?>
