<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_webhooks', function (Blueprint $table) {
            // UUID para URLs externas — evita enumeração sequencial (LOW-24)
            $table->uuid('uuid')->nullable()->after('id');
            $table->unique('uuid');
        });

        // Preenche UUIDs para registros existentes
        DB::table('user_webhooks')->whereNull('uuid')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::table('user_webhooks')
                    ->where('id', $row->id)
                    ->update(['uuid' => Str::uuid()->toString()]);
            }
        });

        // Torna obrigatório após preencher todos
        Schema::table('user_webhooks', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('user_webhooks', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
