<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('integration_keys', function (Blueprint $table) {
            // Permite rotação segura de secrets: novo hash fica aqui até ser promovido
            $table->string('next_secret_hash', 255)->nullable()->after('client_secret');
        });
    }

    public function down(): void
    {
        Schema::table('integration_keys', function (Blueprint $table) {
            $table->dropColumn('next_secret_hash');
        });
    }
};
