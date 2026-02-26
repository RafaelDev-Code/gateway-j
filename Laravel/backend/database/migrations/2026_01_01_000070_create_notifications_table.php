<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_notifications', function (Blueprint $table) {
            $table->id();
            // user_id NULL = notificacao global para todos
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();

            $table->string('title', 100);
            $table->string('message', 500);
            $table->string('type', 30)->default('info')->comment('info, success, warning, danger');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_read');
            $table->index(['user_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_notifications');
    }
};
