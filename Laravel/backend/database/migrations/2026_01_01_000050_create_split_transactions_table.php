<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('split_transactions', function (Blueprint $table) {
            $table->id();

            $table->string('transaction_id', 50);
            $table->foreign('transaction_id')
                  ->references('id')
                  ->on('transactions')
                  ->cascadeOnDelete();

            // Referencia por user_id (mais seguro que username)
            $table->foreignId('target_user_id')->constrained('users');

            $table->unsignedSmallInteger('percentage')->comment('Percentual 1-100');
            $table->decimal('amount', 20, 6)->default(0)->comment('Valor calculado apos confirmacao');
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('transaction_id');
            $table->index('target_user_id');
            $table->index('processed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('split_transactions');
    }
};
