<?php

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');

$appRoot = getenv('APP_ROOT') ?: null;
if ($appRoot === null && is_file(__DIR__ . '/api-root.php')) {
    $appRoot = require __DIR__ . '/api-root.php';
}
$appRoot = $appRoot ?: dirname(__DIR__);

if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($file !== __FILE__ && is_file($file)) {
        return false;
    }
}

require $appRoot . '/vendor/autoload.php';

App\Kernel::create($appRoot)->run();
