<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Acquirers Configuration
    |--------------------------------------------------------------------------
    | Todas as credenciais vem exclusivamente do .env
    | Nenhum valor hardcoded aqui.
    |--------------------------------------------------------------------------
    */

    'pagpix' => [
        'url'     => env('PAGPIX_URL'),
        'key'     => env('PAGPIX_KEY'),
        'active'  => env('PAGPIX_ACTIVE', false),
        'webhook_secret' => env('PAGPIX_WEBHOOK_SECRET'),
    ],

    'rapdyn' => [
        'url'     => env('RAPDYN_URL'),
        'key'     => env('RAPDYN_KEY'),
        'active'  => env('RAPDYN_ACTIVE', false),
        'webhook_secret' => env('RAPDYN_WEBHOOK_SECRET'),
    ],

    'witetec' => [
        'url'              => env('WITETEC_URL'),
        'secret_key'       => env('WITETEC_SECRET_KEY'),
        'merchant_email'   => env('WITETEC_MERCHANT_EMAIL'),
        'merchant_password'=> env('WITETEC_MERCHANT_PASSWORD'),
        'active'           => env('WITETEC_ACTIVE', false),
        'webhook_secret'   => env('WITETEC_WEBHOOK_SECRET'),
    ],

    'strike' => [
        'url'        => env('STRIKE_URL'),
        'public_key' => env('STRIKE_PUBLIC_KEY'),
        'secret_key' => env('STRIKE_SECRET_KEY'),
        'active'     => env('STRIKE_ACTIVE', false),
        'webhook_secret' => env('STRIKE_WEBHOOK_SECRET'),
    ],

    'versell' => [
        'url'       => env('VERSELL_URL'),
        'client_id' => env('VERSELL_CLIENT_ID'),
        'secret'    => env('VERSELL_SECRET'),
        'active'    => env('VERSELL_ACTIVE', false),
        'webhook_secret' => env('VERSELL_WEBHOOK_SECRET'),
    ],

    'bspay' => [
        'url'           => env('BSPAY_URL'),
        'client_id'     => env('BSPAY_CLIENT_ID'),
        'client_secret' => env('BSPAY_CLIENT_SECRET'),
        'active'        => env('BSPAY_ACTIVE', false),
        'webhook_secret' => env('BSPAY_WEBHOOK_SECRET'),
    ],

];
