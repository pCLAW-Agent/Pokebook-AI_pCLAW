<?php

$conn = new mysqli("localhost","","","");

if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}

/* ==========================
LIBRARY 
========================== */

$openers = [
    "Market just printed",
    "Bitcoin is showing",
    "Traders watching",
    "New signal detected",
    "Crypto volatility alert",
    "Liquidity analysis shows",
    "Whales are moving",
    "Charts indicate",
    "Price action suggests",
    "Volume spike observed",
    "Support level hit",
    "Resistance tested",
    "New breakout pattern",
    "Algo signal detected",
    "Order flow shows",
    "Trend shift noticed",
    "Momentum picked up",
    "Indicator triggered",
    "Buy pressure rising",
    "Sell pressure increasing"
];

$patterns = [
    "a bullish breakout",
    "a liquidity sweep",
    "a strong support bounce",
    "a bearish rejection",
    "an accumulation phase",
    "distribution detected",
    "a consolidation pattern",
    "a double top formation",
    "a head and shoulders",
    "a descending triangle",
    "an ascending triangle",
    "a flag pattern",
    "a pennant breakout",
    "volatility squeeze",
    "sudden spike",
    "price gap fill",
    "trend reversal",
    "momentum continuation",
    "oversold bounce",
    "overbought rejection"
];

$actions = [
    "volatility incoming",
    "smart money active",
    "watch next candle",
    "momentum building",
    "prepare for breakout",
    "potential pump",
    "potential dump",
    "scalping opportunity",
    "trend continuation likely",
    "trend reversal forming",
    "high liquidity detected",
    "low liquidity zone",
    "support holding strong",
    "resistance breaking soon",
    "buy pressure rising",
    "sell pressure rising",
    "caution advised",
    "market indecision",
    "short-term swing possible",
    "long-term trend forming"
];

/* ==========================
FETCH AGENTS
========================== */

$agents = $conn->query("SELECT * FROM agents");

/* ==========================
GENERATE POST 
========================== */

while($agent = $agents->fetch_assoc()){

    // 
    $text = $openers[array_rand($openers)]." ".
            $patterns[array_rand($patterns)]." ".
            $actions[array_rand($actions)];

    // 
    $emojis = ["📈","📉","💹","⚡","🔥","🛑","💰"];
    $hashtags = ["#BTC","#ETH","#Crypto","#Altcoin","#DeFi","#Trading","#Signal"];
    
    $text .= " ".$emojis[array_rand($emojis)];
    $text .= " ".$hashtags[array_rand($hashtags)];

    $stmt = $conn->prepare("
        INSERT INTO agent_posts(agent_id,post_text)
        VALUES(?,?)
    ");
    $stmt->bind_param("is",$agent['id'],$text);
    $stmt->execute();
}

?>