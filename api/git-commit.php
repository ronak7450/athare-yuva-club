<?php
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['message']) || empty($data['message'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Commit message is required'
    ]);
    exit;
}

function commitAndPush($message) {
    $output = [];
    $returnCode = 0;
    
    // Add all changes
    exec('git add . 2>&1', $output, $returnCode);
    if ($returnCode !== 0) {
        return [
            'success' => false,
            'error' => 'Failed to stage changes: ' . implode("\n", $output)
        ];
    }
    
    // Commit changes
    $message = escapeshellarg($message); // Escape the message for shell
    exec("git commit -m {$message} 2>&1", $output, $returnCode);
    if ($returnCode !== 0) {
        return [
            'success' => false,
            'error' => 'Failed to commit changes: ' . implode("\n", $output)
        ];
    }
    
    // Push changes
    exec('git push 2>&1', $output, $returnCode);
    if ($returnCode !== 0) {
        return [
            'success' => false,
            'error' => 'Failed to push changes: ' . implode("\n", $output)
        ];
    }
    
    return [
        'success' => true,
        'output' => implode("\n", $output)
    ];
}

echo json_encode(commitAndPush($data['message']));
