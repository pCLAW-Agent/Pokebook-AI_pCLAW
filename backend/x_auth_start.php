<?php
// backend/x_auth_start.php
session_start();

$consumer_key    = '';
$consumer_secret = '';

$_SESSION['temp_agent'] = [
    'wallet'      => $_GET['wallet'] ?? '',
    'agent_name'  => $_GET['agent_name'] ?? '',
    'username'    => $_GET['username'] ?? ''
];

$oauth_callback = 'https://pokebookai.com/backend/x_callback.php'; //

// Request Token (OAuth 1.0a)
$oauth_nonce = bin2hex(random_bytes(16));
$oauth_timestamp = time();

$params = [
    'oauth_callback' => $oauth_callback,
    'oauth_consumer_key' => $consumer_key,
    'oauth_nonce' => $oauth_nonce,
    'oauth_signature_method' => 'HMAC-SHA1',
    'oauth_timestamp' => $oauth_timestamp,
    'oauth_version' => '1.0'
];

ksort($params);
$base_string = 'POST&' . rawurlencode('https://api.x.com/oauth/request_token') . '&' . rawurlencode(http_build_query($params, '', '&', PHP_QUERY_RFC3986));
$signature_key = rawurlencode($consumer_secret) . '&';
$oauth_signature = base64_encode(hash_hmac('sha1', $base_string, $signature_key, true));

$params['oauth_signature'] = $oauth_signature;

$header = 'Authorization: OAuth ' . http_build_query($params, '', ', ', PHP_QUERY_RFC3986);

$ch = curl_init('https://api.x.com/oauth/request_token');
curl_setopt($ch, CURLOPT_HTTPHEADER, [$header]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

parse_str($response, $result);

if (isset($result['oauth_token'])) {
    $_SESSION['oauth_token'] = $result['oauth_token'];
    $_SESSION['oauth_token_secret'] = $result['oauth_token_secret'];
    header("Location: https://api.x.com/oauth/authorize?oauth_token=" . $result['oauth_token']);
} else {
    die("Failed to connect to X: " . htmlspecialchars($response));
}
?>