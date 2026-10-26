<?php

use App\Controllers\AuthController;
use App\Controllers\ConteudoController;
use App\Controllers\ContatoController;
use App\Controllers\EventosController;
use App\Controllers\HealthController;
use App\Controllers\LivesController;
use App\Controllers\MensagensController;
use App\Controllers\ResumoController;
use App\Controllers\UploadsController;
use App\Controllers\UsuariosController;
use App\Middleware\RequireAuth;
use App\Support\Env;
use Slim\App;
use Slim\Routing\RouteCollectorProxy as Group;

return function (App $app): void {
    $app->group('/api', function (Group $api) {
        $api->get('/health', [HealthController::class, 'show']);
        $api->get('/conteudo', [ConteudoController::class, 'show']);
        $api->get('/lives', [LivesController::class, 'index']);
        $api->get('/lives/atual', [LivesController::class, 'current']);
        $api->get('/lives/{id:[0-9]+}', [LivesController::class, 'show']);
        $api->get('/eventos', [EventosController::class, 'index']);
        $api->post('/contato', [ContatoController::class, 'contato']);
        $api->post('/oracao', [ContatoController::class, 'oracao']);

        $api->post('/auth/login', [AuthController::class, 'login']);
        $api->post('/auth/logout', [AuthController::class, 'logout']);
        $api->get('/auth/me', [AuthController::class, 'me']);
        $api->post('/auth/esqueci', [AuthController::class, 'forgotPassword']);
        $api->post('/auth/redefinir', [AuthController::class, 'resetPassword']);

        $api->group('/admin', function (Group $admin) {
            $admin->get('/resumo', [ResumoController::class, 'show']);
            $admin->get('/oembed', [LivesController::class, 'lookup']);
            $admin->post('/lives', [LivesController::class, 'store']);
            $admin->put('/lives/{id:[0-9]+}', [LivesController::class, 'update']);
            $admin->delete('/lives/{id:[0-9]+}', [LivesController::class, 'destroy']);
            $admin->post('/lives/{id:[0-9]+}/thumbnail', [LivesController::class, 'uploadThumbnail']);
            $admin->get('/eventos', [EventosController::class, 'adminIndex']);
            $admin->post('/eventos', [EventosController::class, 'store']);
            $admin->put('/eventos/{id:[0-9]+}', [EventosController::class, 'update']);
            $admin->delete('/eventos/{id:[0-9]+}', [EventosController::class, 'destroy']);
        })->add(new RequireAuth(['admin', 'editor']));

        $api->group('/admin', function (Group $admin) {
            $admin->get('/mensagens', [MensagensController::class, 'index']);
            $admin->patch('/mensagens/{id:[0-9]+}', [MensagensController::class, 'update']);
            $admin->delete('/mensagens/{id:[0-9]+}', [MensagensController::class, 'destroy']);
            $admin->put('/conteudo', [ConteudoController::class, 'update']);
            $admin->post('/imagens', [UploadsController::class, 'store']);
            $admin->get('/usuarios', [UsuariosController::class, 'index']);
            $admin->post('/usuarios', [UsuariosController::class, 'store']);
            $admin->put('/usuarios/{id:[0-9]+}', [UsuariosController::class, 'update']);
            $admin->delete('/usuarios/{id:[0-9]+}', [UsuariosController::class, 'destroy']);
        })->add(new RequireAuth(['admin']));
    });

    if (!Env::isProduction()) {
        $app->get('/uploads/{path:.+}', [UploadsController::class, 'show']);
    }
};
