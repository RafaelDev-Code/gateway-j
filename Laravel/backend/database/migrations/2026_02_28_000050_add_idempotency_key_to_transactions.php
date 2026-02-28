<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Chave de idempotência para saques — previne duplicatas por retry de rede
            $table->string('idempotency_key', 128)->nullable()->after('external_id');
            $table->unique(['user_id', 'idempotency_key'], 'transactions_user_idempotency_unique');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('transactions_user_idempotency_unique');
            $table->dropColumn('idempotency_key');
        });
    }
};
