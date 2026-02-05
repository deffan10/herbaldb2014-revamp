<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('species_aliases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species')->cascadeOnDelete();
            $table->string('alias_name', 200);
            $table->string('discoverer', 100)->nullable(); // Founder name
            $table->string('variety', 100)->nullable();
            $table->foreignId('reference_id')->nullable()->constrained('references')->nullOnDelete();
            
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index('alias_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('species_aliases');
    }
};
