<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GatewayConfigSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('gateway_configs')->insertOrIgnore([
            'tax_cashin'     => 2.0000,
            'tax_cashout'    => 2.0000,
            'tax_min'        => 1.000000,
            'tax_internal'   => 0.0000,
            'anti_fraud_min' => 0.000000,
            'gateway_name'   => config('gateway.name', 'Gateway'),
            'primary_color'  => '#f30f22',
            'secondary_color'=> '#0D0202',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }
}
