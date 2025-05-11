<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('payment_id')->unique(); // Stripe payment ID
            $table->string('customer_id')->nullable(); // Stripe customer ID
            $table->string('currency')->default('inr');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Store full Stripe response if needed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

