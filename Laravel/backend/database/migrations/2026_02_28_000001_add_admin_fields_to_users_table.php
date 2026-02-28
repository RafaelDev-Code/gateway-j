<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            $table->timestamp('banned_at')->nullable()->after('last_login_at');
            $table->text('ban_reason')->nullable()->after('banned_at');
            $table->unsignedBigInteger('manager_id')->nullable()->after('ban_reason');
            $table->boolean('blocked_credentials')->default(false)->after('manager_id');
            $table->decimal('auto_cashout_limit', 20, 6)->nullable()->after('blocked_credentials')
                  ->comment('Limite em R$ para saque automatico. NULL = nao permitido.');

            $table->foreign('manager_id')->references('id')->on('users')->nullOnDelete();
            $table->index('banned_at');
            $table->index('manager_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn([
                'last_login_at', 'banned_at', 'ban_reason',
                'manager_id', 'blocked_credentials', 'auto_cashout_limit',
            ]);
        });
    }
};
