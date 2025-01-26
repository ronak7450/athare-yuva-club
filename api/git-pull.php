<?php
header('Content-Type: application/json');

function pullChanges() {
    $output = [];
    $returnCode = 0;
    
    // Pull latest changes
    exec('git pull 2>&1', $output, $returnCode);
    
    if ($returnCode !== 0) {
        return [
            'success' => false,
            'error' => 'Failed to pull changes: ' . implode("\n", $output)
        ];
    }
    
    return [
        'success' => true,
        'output' => implode("\n", $output)
    ];
}

echo json_encode(pullChanges());
