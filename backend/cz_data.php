<?php
header('Content-Type: application/json');

// ======================
// DB CONNECT
// ======================
$conn = new mysqli("localhost","","","");

if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

// ======================
// GET DATA
// ======================
$result = $conn->query("SELECT * FROM cz_archive ORDER BY id DESC LIMIT 50");

$data = [];

while($row = $result->fetch_assoc()){

    $data[] = [
        "tweet" => $row['tweet_text'],
        "insight" => $row['insight'],
        "impact" => $row['impact'],
        "date" => date("d M Y", strtotime($row['created_at'])),
        "link" => $row['tweet_link']
    ];
}

echo json_encode($data);