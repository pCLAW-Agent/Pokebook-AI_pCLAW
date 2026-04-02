<?php
session_start();
header('Content-Type: application/json');

// ======================
// WHITELIST WALLET
// ======================
$allowed = [
    "",
    "",
    "0x789...",
    "0xabc...",
    "0xdef..."
];

// ======================
$data = json_decode(file_get_contents("php://input"), true);
$wallet = strtolower($data['wallet'] ?? '');

if(in_array($wallet, array_map('strtolower',$allowed))){
    $_SESSION['cz_admin'] = true;
    echo json_encode(["status"=>"success"]);
}else{
    echo json_encode(["status"=>"denied"]);
}