<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Gateway Configuration
    |--------------------------------------------------------------------------
    */

    'name' => env('GATEWAY_NAME', 'Gateway de Pagamentos'),

    'default_acquirer' => env('GATEWAY_DEFAULT_ACQUIRER', 'PAGPIX'),

    'anti_fraud_min' => env('GATEWAY_ANTI_FRAUD_MIN', 0),

    /*
    |--------------------------------------------------------------------------
    | Rate Limits (requisicoes por minuto)
    |--------------------------------------------------------------------------
    */
    'rate_limits' => [
        'api'       => 60,
        'cashin'    => 30,
        'cashout'   => 10,
        'transfer'  => 10,
        'webhooks'  => 300,
        'admin_login' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Transaction ID Prefix
    |--------------------------------------------------------------------------
    */
    'transaction_prefix' => 'e',

    /*
    |--------------------------------------------------------------------------
    | Postback Settings
    |--------------------------------------------------------------------------
    */
    'postback' => [
        'timeout'     => 10,
        'retry_times' => 3,
        'retry_sleep' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Settings (para chamadas as adquirentes)
    |--------------------------------------------------------------------------
    */
    'http' => [
        'timeout'         => 30,
        'connect_timeout' => 10,
        'retry_times'     => 2,
        'retry_sleep'     => 500,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache TTLs (em segundos)
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'gateway_config' => 3600,  // 1 hora
        'user_taxes'     => 300,   // 5 minutos
        'acquirer_token' => 1800,  // 30 minutos (para tokens de auth de adquirentes)
    ],

];
