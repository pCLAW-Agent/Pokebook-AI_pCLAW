<?php
ini_set('display_errors',0);
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

/* =========================
DATABASE
========================= */
$conn = new mysqli("localhost","","","");

/* =========================
DEFAULT RESPONSE
========================= */
$response = [
    'ticker' => 'UNKNOWN',
    'price' => 'N/A',
    'social_metrics' => [],
    'ai_summary' => '',
    'agent' => null,
    'binance' => null,
    'advanced' => null,
    'chain' => null
];

/* =========================
INPUT
========================= */
$address = trim($_POST['address'] ?? '');
$chain   = $_POST['chain'] ?? 'bsc';

$response['chain'] = $chain;

/* =========================
VALIDATE ADDRESS
========================= */
if($chain === 'bsc' && !preg_match('/^0x[a-f0-9]{40}$/i',$address)){
    echo json_encode(['error'=>'Invalid BSC address']);
    exit;
}

if($chain === 'sol' && !preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/',$address)){
    echo json_encode(['error'=>'Invalid SOL address']);
    exit;
}

/* =========================
AGENT DATABASE
========================= */
$stmt = $conn->prepare("
SELECT id, agent_name, username, profile_image, verify
FROM agents
WHERE token_address = ?
LIMIT 1
");
$stmt->bind_param("s", $address);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0){
    $agent = $result->fetch_assoc();

    $postStmt = $conn->prepare("SELECT COUNT(*) as total_posts FROM agent_posts WHERE agent_id = ?");
    $postStmt->bind_param("i", $agent['id']);
    $postStmt->execute();
    $postResult = $postStmt->get_result();

    $agent['total_posts'] = $postResult->fetch_assoc()['total_posts'] ?? 0;
    $response['agent'] = $agent;
}

/* =========================
DEXSCREENER
========================= */
$dex = json_decode(@file_get_contents("https://api.dexscreener.com/latest/dex/search?q=".$address), true);

if(empty($dex['pairs'])){
    echo json_encode(['error'=>'Token not found']);
    exit;
}

usort($dex['pairs'], fn($a,$b)=>($b['liquidity']['usd']??0) <=> ($a['liquidity']['usd']??0));
$pair = $dex['pairs'][0];

$response['ticker'] = strtoupper($pair['baseToken']['symbol'] ?? 'UNKNOWN');
$response['price']  = "$".number_format($pair['priceUsd'] ?? 0,8);

/* =========================
LUNARCRUSH
========================= */
$lunarApiKey = "YOUR_KEY";

$ch = curl_init("https://lunarcrush.com/api4/public/coins/".$response['ticker']."/v1");
curl_setopt_array($ch,[
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer ".$lunarApiKey],
    CURLOPT_TIMEOUT => 10
]);

$lunar = json_decode(curl_exec($ch),true);
curl_close($ch);

$data = $lunar['data'] ?? [];

$response['social_metrics'] = [
    'alt_rank' => $data['alt_rank'] ?? 'N/A',
    'galaxy_score' => $data['galaxy_score'] ?? 'N/A',
];

/* =========================

========================= */
$url = "https://pokebookai.com/api/ai_metadata"
      ."?chain=".$chain
      ."&address=".$address;

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10
]);

$api = json_decode(curl_exec($ch), true);
curl_close($ch);

/* =========================
HANDLE  DATA (RAW)
========================= */
if(!empty($api) && isset($api['raw'])){

    $b = $api['raw'];

    // 
    $response['binance'] = $b;

    $response['advanced'] = [
        "top10HoldersPercentage" => $b['top10HoldersPercentage'] ?? 0,
        "kolHolders" => $b['kolHolders'] ?? 0,
        "kolHoldingPercent" => $b['kolHoldingPercent'] ?? 0,
        "proHolders" => $b['proHolders'] ?? 0,
        "proHoldingPercent" => $b['proHoldingPercent'] ?? 0,
        "smartMoneyHolders" => $b['smartMoneyHolders'] ?? 0,
        "smartMoneyHoldingPercent" => $b['smartMoneyHoldingPercent'] ?? 0
    ];

} else {

    $response['advanced'] = [
        "top10HoldersPercentage" => 0,
        "kolHolders" => 0,
        "kolHoldingPercent" => 0,
        "proHolders" => 0,
        "proHoldingPercent" => 0,
        "smartMoneyHolders" => 0,
        "smartMoneyHoldingPercent" => 0
    ];
}

/* =========================
AI SUMMARY
========================= */
$trend = "neutral";
$risk  = "balanced";

if(!empty($response['binance'])){
    $b = $response['binance'];

    $change = floatval($b['percentChange24h'] ?? 0);
    $top10  = floatval($b['top10HoldersPercentage'] ?? 0);
    $smart  = intval($b['smartMoneyHolders'] ?? 0);

    if($change > 5) $trend = "strong bullish";
    elseif($change > 0) $trend = "uptrend";
    elseif($change < -5) $trend = "heavy sell";
    elseif($change < 0) $trend = "downtrend";

    if($top10 > 80) $risk = "high centralization";
    elseif($top10 > 60) $risk = "moderate concentration";

    if($smart > 5) $trend .= " + smart money";
}

$response['ai_summary'] =
"Market: <strong>$trend</strong><br>".
"Structure: <strong>$risk</strong>";

/* =========================
OUTPUT
========================= */
echo json_encode($response);
