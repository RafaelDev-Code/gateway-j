<?php

use Illuminate\Support\Str;

return [

    'name'   => env('APP_NAME', 'Gateway'),
    'prefix' => env('HORIZON_PREFIX', 'gateway_horizon:'),
    'domain' => null,
    'path'   => 'horizon',

    'use' => 'default',

    'middleware' => ['web', 'auth'],

    'waits' => [
        'redis:default' => 60,
    ],

    'trim' => [
        'recent'           => 60,
        'pending'          => 60,
        'completed'        => 60,
        'recent_failed'    => 10080,
        'failed'           => 10080,
        'monitored'        => 10080,
    ],

    'silenced' => [],

    'metrics' => [
        'trim_snapshots' => [
            'job'   => 24,
            'queue' => 24,
        ],
    ],

    'fast_termination' => false,

    'memory_limit' => 256,

    'defaults' => [
        'supervisor-webhooks' => [
            'connection'        => 'redis',
            'queue'             => ['webhooks'],
            'balance'           => env('HORIZON_BALANCE_STRATEGY', 'auto'),
            'autoScalingStrategy' => 'time',
            'maxProcesses'      => 10,
            'minProcesses'      => 2,
            'balanceMaxShift'   => 1,
            'balanceCooldown'   => 3,
            'workerOptions'     => [
                'maxTries'  => 3,
                'backoff'   => 5,
                'timeout'   => 60,
                'memory'    => 128,
            ],
        ],

        'supervisor-payments' => [
            'connection'        => 'redis',
            'queue'             => ['payments'],
            'balance'           => env('HORIZON_BALANCE_STRATEGY', 'auto'),
            'maxProcesses'      => 6,
            'minProcesses'      => 1,
            'balanceMaxShift'   => 1,
            'balanceCooldown'   => 3,
            'workerOptions'     => [
                'maxTries'  => 5,
                'backoff'   => [5, 10, 30],
                'timeout'   => 90,
                'memory'    => 128,
            ],
        ],

        'supervisor-postbacks' => [
            'connection'        => 'redis',
            'queue'             => ['postbacks'],
            'balance'           => env('HORIZON_BALANCE_STRATEGY', 'auto'),
            'maxProcesses'      => 6,
            'minProcesses'      => 1,
            'balanceMaxShift'   => 1,
            'balanceCooldown'   => 3,
            'workerOptions'     => [
                'maxTries'  => 5,
                'backoff'   => [10, 30, 60],
                'timeout'   => 30,
                'memory'    => 64,
            ],
        ],

        'supervisor-notifications' => [
            'connection'     => 'redis',
            'queue'          => ['notifications'],
            'balance'        => 'simple',
            'maxProcesses'   => 2,
            'minProcesses'   => 1,
            'workerOptions'  => [
                'maxTries' => 3,
                'backoff'  => 30,
                'timeout'  => 30,
                'memory'   => 64,
            ],
        ],

        'supervisor-default' => [
            'connection'     => 'redis',
            'queue'          => ['default'],
            'balance'        => 'simple',
            'maxProcesses'   => 4,
            'minProcesses'   => 1,
            'workerOptions'  => [
                'maxTries' => 3,
                'backoff'  => 10,
                'timeout'  => 60,
                'memory'   => 128,
            ],
        ],
    ],

    'environments' => [
        'production' => [
            'supervisor-webhooks'      => ['minProcesses' => 5,  'maxProcesses' => 10],
            'supervisor-payments'      => ['minProcesses' => 3,  'maxProcesses' => 6],
            'supervisor-postbacks'     => ['minProcesses' => 3,  'maxProcesses' => 6],
            'supervisor-notifications' => ['minProcesses' => 1,  'maxProcesses' => 2],
            'supervisor-default'       => ['minProcesses' => 2,  'maxProcesses' => 4],
        ],

        'local' => [
            'supervisor-webhooks'      => ['minProcesses' => 1, 'maxProcesses' => 2],
            'supervisor-payments'      => ['minProcesses' => 1, 'maxProcesses' => 2],
            'supervisor-postbacks'     => ['minProcesses' => 1, 'maxProcesses' => 2],
            'supervisor-notifications' => ['minProcesses' => 1, 'maxProcesses' => 1],
            'supervisor-default'       => ['minProcesses' => 1, 'maxProcesses' => 2],
        ],
    ],

];
