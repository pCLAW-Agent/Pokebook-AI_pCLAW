<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost","","","");

if ($conn->connect_error) {
    die(json_encode(["error" => "DB Connection failed"]));
}

// =======================
// GET PARAM
// =======================
$start = $_GET['start'] ?? date("Y-m-d", strtotime("-7 days"));
$end   = $_GET['end'] ?? date("Y-m-d");

$search   = $_GET['search'] ?? "";
$verified = $_GET['verified'] ?? "all";

// =======================
// TOTAL AGENTS
// =======================
$q1 = $conn->query("SELECT COUNT(*) as total FROM agents");
$total_agents = $q1->fetch_assoc()['total'] ?? 0;

// =======================
// TOKEN AGENTS
// =======================
$q2 = $conn->query("
SELECT COUNT(*) as total 
FROM agents 
WHERE token_address IS NOT NULL 
AND token_address != ''
");
$total_token_agents = $q2->fetch_assoc()['total'] ?? 0;

// =======================
// TOTAL POSTS
// =======================
$q3 = $conn->query("
SELECT COUNT(*) as total 
FROM agent_posts 
WHERE DATE(created_at) BETWEEN '$start' AND '$end'
");
$total_posts = $q3->fetch_assoc()['total'] ?? 0;

// =======================
// CHART DATA
// =======================
$q4 = $conn->query("
SELECT DATE(created_at) as date, COUNT(*) as total
FROM agent_posts
WHERE DATE(created_at) BETWEEN '$start' AND '$end'
GROUP BY DATE(created_at)
ORDER BY date ASC
");

$labels = [];
$data = [];

$period = new DatePeriod(
    new DateTime($start),
    new DateInterval('P1D'),
    (new DateTime($end))->modify('+1 day')
);

$dateMap = [];
while($row = $q4->fetch_assoc()){
    $dateMap[$row['date']] = (int)$row['total'];
}

foreach($period as $date){
    $d = $date->format("Y-m-d");
    $labels[] = $d;
    $data[] = $dateMap[$d] ?? 0;
}

// =======================
// AGENT LIST (FIX FINAL)
// =======================
$whereAgents = "WHERE 1=1";
$whereSuper  = "WHERE 1=1";

if($search){
    $searchSafe = $conn->real_escape_string($search);
    $whereAgents .= " AND username LIKE '%$searchSafe%'";
    $whereSuper  .= " AND username LIKE '%$searchSafe%'";
}

// 
if($verified === "yes"){
    $whereAgents .= " AND verify='yes'";
}

// =======================
// NORMAL AGENTS
// =======================
$qA = $conn->query("
SELECT 
    agent_name,
    username,
    token_address,
    profile_image,
    verify,
    IFNULL(created_at, NOW()) as created_at,
    'agent' as type
FROM agents
$whereAgents
");

// =======================
// SUPER AGENTS (FIXED)
// =======================
$qS = $conn->query("
SELECT 
    agent_name,
    username,
    token_address,
    image as profile_image,
    verified as verify,
    IFNULL(created_at, NOW()) as created_at,
    'super_agent' as type
FROM super_agents
$whereSuper
");

// =======================
// CHECK QUERY ERROR
// =======================
if(!$qA){
    die(json_encode(["error"=>"Agents query error","detail"=>$conn->error]));
}

if(!$qS){
    die(json_encode(["error"=>"Super agents query error","detail"=>$conn->error]));
}

// =======================
// MERGE DATA
// =======================
$agents = [];

while($row = $qA->fetch_assoc()){
    $agents[] = $row;
}

while($row = $qS->fetch_assoc()){
    $agents[] = $row;
}

// =======================
// SORT SAFE
// =======================
usort($agents, function($a, $b){
    return strtotime($b['created_at'] ?? 'now') - strtotime($a['created_at'] ?? 'now');
});

// =======================
// RESPONSE
// =======================
echo json_encode([
    "total_agents" => (int)$total_agents,
    "total_token_agents" => (int)$total_token_agents,
    "total_posts" => (int)$total_posts,
    "chart_labels" => $labels,
    "chart_data" => $data,
    "agents" => $agents
]);