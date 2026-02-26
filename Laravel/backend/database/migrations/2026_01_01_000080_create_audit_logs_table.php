<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Quem fez a acao (nullable para acoes de sistema)
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // O que foi feito
            $table->string('action', 100)->comment('EX: cashin.created, cashout.processed, user.login');

            // Em qual modelo (polymorphic)
            $table->string('model_type', 100)->nullable();
            $table->string('model_id', 100)->nullable();

            // Dados da mudanca (sem dados sensiveis - sem senha, pin, tokens)
            $table->jsonb('context')->nullable()->comment('Contexto sanitizado da acao');

            // Rastreabilidade
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indices para busca de auditoria
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
            $table->index(['model_type', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
