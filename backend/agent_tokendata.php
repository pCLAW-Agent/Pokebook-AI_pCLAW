<?php

$conn = new mysqli("localhost","","","");

header("Content-Type: application/json");

$result = $conn->query("
SELECT id, username, profile_image, verify, token_address
FROM agents
WHERE token_address IS NOT NULL AND token_address != ''
ORDER BY id DESC
LIMIT 50
");

$agents = [];

while($row = $result->fetch_assoc()){

$token = $row['token_address'];

/* FETCH DEXSCREENER */
$api = "https://api.dexscreener.com/latest/dex/tokens/" . $token;

$response = @file_get_contents($api);

$price = 0;
$mc = 0;
$vol = 0;

if($response){

$data = json_decode($response, true);

if(isset($data['pairs'][0])){

$pair = $data['pairs'][0];

$price = $pair['priceUsd'] ?? 0;
$mc = $pair['fdv'] ?? 0;
$vol = $pair['volume']['h24'] ?? 0;

}

}

$row['price'] = number_format($price,6);
$row['marketcap'] = number_format($mc);
$row['volume'] = number_format($vol);

$agents[] = $row;

}

echo json_encode($agents);

?>