<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('species', function (Blueprint $table) {
            $table->id();
            $table->string('species_code', 20)->unique();
            $table->string('scientific_name', 200);
            $table->string('variety', 100)->nullable();
            $table->string('family', 100)->nullable();
            $table->string('discoverer', 100)->nullable();
            $table->text('description')->nullable();
            $table->text('description_en')->nullable();
            
            // Status workflow
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            
            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reference_id')->nullable()->constrained('references')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('scientific_name');
            $table->fullText(['scientific_name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('species');
    }
};
