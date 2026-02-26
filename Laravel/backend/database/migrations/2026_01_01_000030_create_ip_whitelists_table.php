<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_whitelists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ip_address', 45)->comment('IPv4 ou IPv6');
            $table->string('label', 100)->nullable()->comment('Descricao opcional do IP');
            $table->timestamps();

            $table->index('user_id');
            $table->unique(['user_id', 'ip_address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_whitelists');
    }
};
