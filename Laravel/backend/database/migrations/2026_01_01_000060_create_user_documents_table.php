<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type', 50)->comment('RG_FRENTE, RG_VERSO, CNH, CNPJ, SELFIE, COMPROVANTE');
            $table->string('file_path', 500)->comment('Caminho no storage privado (nunca URL publica)');
            $table->char('file_hash', 64)->nullable()->comment('SHA-256 do arquivo para integridade');
            $table->string('mime_type', 50)->nullable()->comment('MIME real verificado via finfo_file');
            $table->unsignedInteger('file_size')->nullable()->comment('Tamanho em bytes');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_documents');
    }
};
