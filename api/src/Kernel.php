<?php

declare(strict_types=1);

namespace App;

use App\Middleware\Cors;
use App\Middleware\ErrorHandler;
use App\Middleware\JsonGuard;
use App\Middleware\SecurityHeaders;
use App\Support\Env;
use App\Support\Settings;
use Slim\App;
use Slim\Factory\AppFactory;

final class Kernel
{
    public static function boot(string $appRoot): void
    {
        Env::load($appRoot);
        date_default_timezone_set(Settings::get('timezone'));
    }

    public static function create(string $appRoot): App
    {
        self::boot($appRoot);

        $app = AppFactory::create();
        $app->add(new JsonGuard());
        $app->addBodyParsingMiddleware();
        $app->addRoutingMiddleware();
        $app->addErrorMiddleware(!Env::isProduction(), false, false)
            ->setDefaultErrorHandler(new ErrorHandler());
        $app->add(new SecurityHeaders());
        $app->add(new Cors());

        (require $appRoot . '/config/routes.php')($app);
        return $app;
    }
}
