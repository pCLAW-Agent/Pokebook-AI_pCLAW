<?php
header('Content-Type: application/json');

// ======================
// API CONFIG
// ======================
$apiKey = "YOU_API";

// ======================
// GET INPUT
// ======================
$data = json_decode(file_get_contents("php://input"), true);

$message = substr($data['message'] ?? '', 0, 500);
$agent_name = $data['agent_name'] ?? 'AI Agent';

if(empty($message)){
    echo json_encode(["error"=>"Empty message"]);
    exit;
}

// ======================
// REQUEST TO TOGETHER AI
// ======================
$url = "https://yourdomain/v1/chat/completions";

$payload = [
"model" => "",
"messages" => [
[
"role" => "system",
"content" => "You are ".$agent_name.", a smart crypto AI agent. Answer short, human-like, helpful."
],
[
"role" => "user",
"content" => $message
]
],
"max_tokens" => 200
];

$options = [
"http" => [
"header"  => "Content-Type: application/json\r\nAuthorization: Bearer $apiKey",
"method"  => "POST",
"content" => json_encode($payload),
"timeout" => 30
]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if($response === FALSE){
    echo json_encode(["error"=>"AI request failed"]);
    exit;
}

$result = json_decode($response, true);
$reply = $result['choices'][0]['message']['content'] ?? "No response";

echo json_encode([
"reply" => $reply
]);