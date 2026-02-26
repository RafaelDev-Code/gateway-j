<?php

use Illuminate\Support\Facades\Route;

// Redireciona raiz para o admin
Route::get('/', fn () => redirect('/admin'));

// Horizon protegido por middleware (apenas admins autenticados)
// Configurado em app/Providers/HorizonServiceProvider ou via HorizonApplicationServiceProvider
