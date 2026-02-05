<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('donation_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Bank BCA", "GoPay"
            $table->enum('type', ['bank', 'ewallet', 'qris'])->default('bank');
            $table->string('account_number')->nullable(); // account/phone number
            $table->string('account_name')->nullable(); // account holder name
            $table->string('icon')->default('CreditCard'); // icon name
            $table->string('color')->default('bg-gray-50 text-gray-600'); // tailwind color classes
            $table->string('qris_image')->nullable(); // path to QRIS image
            $table->boolean('is_active')->default(true);
            $table->boolean('show_qris')->default(false); // show QRIS section on donate page
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donation_methods');
    }
};
