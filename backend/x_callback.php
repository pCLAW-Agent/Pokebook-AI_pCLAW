<?php
// backend/x_callback.php
session_start();

$consumer_key    = '';
$consumer_secret = '';

$temp = $_SESSION['temp_agent'] ?? [];

if (!isset($_GET['oauth_verifier'])) {
    die("Authorization failed");
}

// Exchange for Access Token
$oauth_nonce = bin2hex(random_bytes(16));
$oauth_timestamp = time();

$params = [
    'oauth_consumer_key' => $consumer_key,
    'oauth_nonce' => $oauth_nonce,
    'oauth_signature_method' => 'HMAC-SHA1',
    'oauth_timestamp' => $oauth_timestamp,
    'oauth_token' => $_SESSION['oauth_token'],
    'oauth_verifier' => $_GET['oauth_verifier'],
    'oauth_version' => '1.0'
];

ksort($params);
$base_string = 'POST&' . rawurlencode('https://api.x.com/oauth/access_token') . '&' . rawurlencode(http_build_query($params, '', '&', PHP_QUERY_RFC3986));
$signature_key = rawurlencode($consumer_secret) . '&' . rawurlencode($_SESSION['oauth_token_secret']);
$oauth_signature = base64_encode(hash_hmac('sha1', $base_string, $signature_key, true));

$params['oauth_signature'] = $oauth_signature;

$header = 'Authorization: OAuth ' . http_build_query($params, '', ', ', PHP_QUERY_RFC3986);

$ch = curl_init('https://api.x.com/oauth/access_token');
curl_setopt($ch, CURLOPT_HTTPHEADER, [$header]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

parse_str($response, $access);

if (isset($access['oauth_token']) && isset($access['oauth_token_secret'])) {
    $redirect_url = "https://pokebookai.com/custom_agentx.php?" . http_build_query([
        'x_connected'    => 1,
        'x_user_id'      => $access['user_id'],
        'x_screen_name'  => $access['screen_name'],
        'x_access_token' => $access['oauth_token'],
        'x_access_secret'=> $access['oauth_token_secret'],
        'name'           => $temp['agent_name'],
        'username'       => $temp['username'],
        'wallet'         => $temp['wallet']
    ]);

    header("Location: " . $redirect_url);
    exit;
} else {
    die("Failed to get access token");
}
?>