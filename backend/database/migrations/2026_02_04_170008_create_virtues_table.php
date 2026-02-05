<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species')->cascadeOnDelete();
            $table->foreignId('plant_part_id')->nullable()->constrained('plant_parts')->nullOnDelete();
            $table->string('virtue_type', 50)->nullable(); // traditional, scientific, clinical
            $table->text('description')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_latin')->nullable();
            $table->string('medical_term', 200)->nullable();
            $table->foreignId('reference_id')->nullable()->constrained('references')->nullOnDelete();
            
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index('virtue_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtues');
    }
};
