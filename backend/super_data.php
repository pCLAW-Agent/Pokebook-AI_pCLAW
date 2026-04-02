<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$conn = new mysqli("localhost", "", "", "");
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed"]);
    exit;
}
$conn->set_charset("utf8mb4");

$sql = "
SELECT 
    sa.id,
    sa.agent_name,
    COALESCE(sa.username, '') AS username,
    COALESCE(sa.image, '') AS profile_image,
    COALESCE(sa.verified, 'no') AS verified,
    sa.platform,
    
    -- Telegram Fields
    COUNT(DISTINCT atg.chat_id) AS group_count,
    COALESCE(SUM(atg.member_count), 0) AS total_members,
    SUBSTRING_INDEX(
        GROUP_CONCAT(
            DISTINCT CONCAT(
                COALESCE(atg.group_title, ''),
                '||',
                COALESCE(atg.group_username, '')
            )
            ORDER BY atg.last_seen DESC SEPARATOR ';;;'
        ), ';;;', 1
    ) AS top_group,

    -- X Fields
    COALESCE(sax.followers_count, 0) AS followers_count,
    COALESCE(sax.following_count, 0) AS following_count,
    COALESCE(sax.total_posts, 0) AS total_posts,
    COALESCE(sax.total_mentions, 0) AS total_mentions

FROM super_agents sa
LEFT JOIN agent_telegram_groups atg ON sa.id = atg.agent_id
LEFT JOIN super_agents_x sax ON sa.id = sax.agent_id
GROUP BY 
    sa.id, sa.agent_name, sa.username, sa.image, sa.verified, 
    sa.platform, sax.followers_count, sax.following_count, 
    sax.total_posts, sax.total_mentions
ORDER BY sa.agent_name ASC
";

$result = $conn->query($sql);
if (!$result) {
    echo json_encode(["error" => "Query failed", "sql_error" => $conn->error]);
    exit;
}

$agents = [];
while ($row = $result->fetch_assoc()) {
    $row['group_count'] = (int)$row['group_count'];
    $row['total_members'] = (int)$row['total_members'];
    $row['followers_count'] = (int)$row['followers_count'];
    $row['following_count'] = (int)$row['following_count'];
    $row['total_posts'] = (int)$row['total_posts'];
    $row['total_mentions'] = (int)$row['total_mentions'];

    // Parse top group for Telegram
    $topGroup = null;
    if (!empty($row['top_group'])) {
        list($title, $username) = explode('||', $row['top_group'] . '||');
        $topGroup = [
            'title' => trim($title),
            'username' => trim($username)
        ];
    }
    $row['top_group'] = $topGroup;

    $agents[] = $row;
}

echo json_encode($agents, JSON_UNESCAPED_UNICODE);
$conn->close();
?>