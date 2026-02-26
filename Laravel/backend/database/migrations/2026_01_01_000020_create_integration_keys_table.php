<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // client_id eh publico (equivalente ao "username" da API)
            $table->string('client_id', 100)->unique();

            // client_secret e hashado com SHA-256 (irreversivel)
            $table->string('client_secret', 255);

            // Metadados
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->string('domain', 255)->nullable()->comment('Dominio autorizado para uso desta key');

            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index(['client_id', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_keys');
    }
};
