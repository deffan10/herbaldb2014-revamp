<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('compounds', function (Blueprint $table) {
            $table->string('molecular_formula', 100)->nullable()->after('pubchem_id');
            $table->decimal('molecular_weight', 10, 4)->nullable()->after('molecular_formula');
            $table->string('cas_number', 50)->nullable()->after('molecular_weight');
            $table->text('smiles')->nullable()->after('cas_number');
            $table->text('inchi')->nullable()->after('smiles');
            $table->string('inchi_key', 50)->nullable()->after('inchi');
        });
    }

    public function down(): void
    {
        Schema::table('compounds', function (Blueprint $table) {
            $table->dropColumn([
                'molecular_formula',
                'molecular_weight',
                'cas_number',
                'smiles',
                'inchi',
                'inchi_key',
            ]);
        });
    }
};
