<?php
// ======================
// SMART MONEY FLOW
// ======================
$conn = new mysqli("localhost", "", "", "");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die("DB Error: " . $conn->connect_error);
}

echo "[" . date('Y-m-d H:i:s') . "] Smart Money Cron Started\n";

/* ======================
GET AGENTS
====================== */
$stmt = $conn->prepare("
    SELECT id, agent_name, telegram_bot_token 
    FROM super_agents 
    WHERE agent_skill = 'Smart Money Flow' 
    AND telegram_bot_token IS NOT NULL
");
$stmt->execute();
$agents = $stmt->get_result();

if ($agents->num_rows === 0) {
    echo "❌ No agent found.\n";
    exit;
}

while ($agent = $agents->fetch_assoc()) {

    $agent_id = $agent['id'];
    $botToken = $agent['telegram_bot_token'];

    echo "🔄 Processing: {$agent['agent_name']}\n";

    $signals = fetchLatestSmartMoneySignals();

    if (empty($signals)) {
        echo "❌ No signals from API\n";
        continue;
    }

    $message = buildSmartMoneyMessage($signals);

    $sentCount = 0;

    /* ======================
    PRIVATE CHAT
    ====================== */
    $privStmt = $conn->prepare("SELECT DISTINCT user_id FROM agent_telegram_logs WHERE agent_id = ?");
    $privStmt->bind_param("s", $agent_id);
    $privStmt->execute();
    $privates = $privStmt->get_result();

    $privCount = $privates->num_rows;

    while ($priv = $privates->fetch_assoc()) {
        if (sendTelegramMessage($botToken, $priv['user_id'], $message)) {
            $sentCount++;
        }
    }

    /* ======================
    GROUP CHAT
    ====================== */
    $groupStmt = $conn->prepare("SELECT chat_id FROM agent_telegram_groups WHERE agent_id = ?");
    $groupStmt->bind_param("s", $agent_id);
    $groupStmt->execute();
    $groups = $groupStmt->get_result();

    $groupCount = $groups->num_rows;

    while ($group = $groups->fetch_assoc()) {
        if (sendTelegramMessage($botToken, $group['chat_id'], $message)) {
            $sentCount++;
        }
    }

    if ($sentCount > 0) {
        echo "✅ Sent: $sentCount (Private: $privCount | Group: $groupCount)\n";
        $conn->query("UPDATE super_agents SET last_smart_money_check = NOW() WHERE id = '{$agent_id}'");
    } else {
        echo "⚠️ No destination\n";
    }
}

echo "[" . date('Y-m-d H:i:s') . "] Done\n";

/* ======================
FETCH FROM  API
====================== */
function fetchLatestSmartMoneySignals() {

    $url = "https://pokebookai.com/api/ai_smart_money_flow";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10
    ]);

    $res = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($res, true);

    if (empty($data['data'])) return [];

    $signals = $data['data'];

    // SORT by latest signal
    usort($signals, fn($a,$b)=>($b['signalTriggerTime'] ?? 0) <=> ($a['signalTriggerTime'] ?? 0));

    return array_slice($signals, 0, 4);
}

/* ======================
BUILD MESSAGE
====================== */
function buildSmartMoneyMessage($signals) {

    $output = "🚨 *pCLAW SMART MONEY FLOW* 🚨\n\n";

    foreach ($signals as $s) {

        $ticker = strtoupper($s['ticker'] ?? 'UNKNOWN');
        $chain  = ($s['chainId'] ?? '') === 'CT_501' ? 'SOL' : 'BSC';

        $ca = $s['contractAddress'] ?? '';
        $shortCa = substr($ca, 0, 6) . "..." . substr($ca, -4);

        $direction = strtoupper($s['direction'] ?? 'BUY');
        $entry = number_format($s['alertPrice'] ?? 0, 8);
        $now   = number_format($s['currentPrice'] ?? 0, 8);
        $gain  = $s['maxGain'] ?? 0;
        $mcap  = number_format(($s['currentMarketCap'] ?? 0) / 1000000, 2) . "M";
        $time  = date("d/m H:i", ($s['signalTriggerTime'] ?? 0) / 1000);

        $output .= "*\$$ticker* | $chain\n";
        $output .= "`$shortCa`\n";
        $output .= "$direction | +$gain%\n";
        $output .= "$entry → $now\n";
        $output .= "MC: $$mcap\n";
        $output .= "Wallets: {$s['smartMoneyCount']}\n";
        $output .= "$time\n";
        $output .= "──────────────\n\n";
    }

    $output .= "⚡ pCLAW AI | pokebookai.com";

    return $output;
}

/* ======================
SEND TELEGRAM
====================== */
function sendTelegramMessage($botToken, $chatId, $text) {

    $url = "https://api.telegram.org/bot$botToken/sendMessage";

    $payload = [
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'Markdown'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);

    return true;
}
?>
