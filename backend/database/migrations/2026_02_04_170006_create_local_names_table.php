<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('local_names', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species')->cascadeOnDelete();
            $table->string('name', 200);
            $table->string('language', 50)->nullable(); // Indonesian, Javanese, Sundanese
            $table->string('region', 100)->nullable();
            $table->foreignId('reference_id')->nullable()->constrained('references')->nullOnDelete();
            
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('local_names');
    }
};
