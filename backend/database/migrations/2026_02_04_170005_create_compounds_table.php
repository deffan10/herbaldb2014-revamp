<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compounds', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('knapsack_id', 20)->nullable();
            $table->string('metabolite_id', 100)->nullable();
            $table->string('pubchem_id', 20)->nullable();
            $table->foreignId('compound_group_id')->nullable()->constrained('compound_groups')->nullOnDelete();
            $table->string('mol_file_path', 255)->nullable();
            $table->string('mol2_file_path', 255)->nullable();
            
            // Status workflow
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
            
            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('name');
            $table->fullText('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compounds');
    }
};
