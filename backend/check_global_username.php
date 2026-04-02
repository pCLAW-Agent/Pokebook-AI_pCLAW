<?php
// backend/check_global_username.php
// 

function checkGlobalUsername($conn, $username) {
    $username_clean = strtolower(trim($username));

    if (empty($username_clean)) {
        return ["status" => "error", "message" => "Username cannot be empty"];
    }

    // 
    $stmt1 = $conn->prepare("SELECT id FROM agents WHERE LOWER(username) = ? LIMIT 1");
    $stmt1->bind_param("s", $username_clean);
    $stmt1->execute();
    $stmt1->store_result();
    if ($stmt1->num_rows > 0) {
        $stmt1->close();
        return ["status" => "error", "message" => "Username already taken in Agents"];
    }
    $stmt1->close();

    // 
    $stmt2 = $conn->prepare("SELECT id FROM super_agents WHERE LOWER(username) = ? LIMIT 1");
    $stmt2->bind_param("s", $username_clean);
    $stmt2->execute();
    $stmt2->store_result();
    if ($stmt2->num_rows > 0) {
        $stmt2->close();
        return ["status" => "error", "message" => "Username already taken in Super Agents"];
    }
    $stmt2->close();

    return ["status" => "success", "message" => "Username available"];
}
?>