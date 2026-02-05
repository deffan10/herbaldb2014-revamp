<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('species_compounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species')->cascadeOnDelete();
            $table->foreignId('compound_id')->constrained('compounds')->cascadeOnDelete();
            $table->foreignId('plant_part_id')->nullable()->constrained('plant_parts')->nullOnDelete();
            $table->foreignId('reference_id')->nullable()->constrained('references')->nullOnDelete();
            $table->text('notes')->nullable();
            
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->unique(['species_id', 'compound_id', 'plant_part_id'], 'species_compound_part_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('species_compounds');
    }
};
