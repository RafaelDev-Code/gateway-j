<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            // ID no formato e{32chars} compativel com o sistema legado
            $table->string('id', 50)->primary();

            // IDs externos
            $table->string('end2end', 100)->nullable()->comment('Codigo END2END do PIX');
            $table->string('external_id', 100)->nullable()->comment('ID na adquirente');

            // Relacionamento com usuario
            $table->foreignId('user_id')->constrained('users');

            // Valores
            $table->decimal('amount', 20, 6);
            $table->decimal('tax', 20, 6)->default(0);

            // Status e tipo
            $table->enum('status', ['PAID', 'PENDING', 'CANCELLED', 'REVERSED'])->default('PENDING');
            $table->enum('type', ['DEPOSIT', 'WITHDRAW', 'INTERNAL_TRANSFER']);

            // Dados do pagador/recebedor
            $table->string('nome', 100)->nullable();
            $table->string('descricao', 255)->nullable();
            $table->string('document', 20)->nullable()->comment('CPF ou CNPJ do pagador');

            // Postback para o merchant (encriptado)
            $table->text('postback_url')->nullable()->comment('Encriptado com Crypt::encrypt');
            $table->string('postback_status', 20)->nullable()->comment('SENT, FAILED, PENDING');

            // Flags
            $table->boolean('is_api')->default(false)->comment('Gerado via API ou dashboard');
            $table->boolean('is_internal')->default(false)->comment('Transferencia interna');

            // Timestamps customizados
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            // Indices otimizados para queries de relatorio e busca
            $table->index('end2end');
            $table->index('external_id');
            $table->index('status');
            $table->index('type');
            $table->index('created_at');
            // Indice composto - a query mais comum: usuario + status + tipo + data
            $table->index(['user_id', 'status', 'type', 'created_at'], 'idx_transactions_report');
            $table->index(['user_id', 'status'], 'idx_transactions_user_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
