<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add legacy fields to species table
        Schema::table('species', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('status');
            $table->string('photo', 255)->nullable()->after('description_en');
        });

        // Add legacy fields to compounds table
        Schema::table('compounds', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('status');
            $table->string('source', 100)->nullable()->after('mol2_file_path');
            $table->string('species_source', 100)->nullable()->after('source');
        });

        // Add legacy fields to local_names table
        Schema::table('local_names', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('status');
        });

        // Add legacy fields to species_aliases table
        Schema::table('species_aliases', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('reference_id');
        });

        // Add legacy fields to virtues table
        Schema::table('virtues', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('reference_id');
        });

        // Add legacy fields to compound_groups table
        Schema::table('compound_groups', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->text('description')->nullable()->after('name_en');
            $table->boolean('is_legacy')->default(false)->after('description');
        });

        // Add legacy fields to plant_parts table
        Schema::table('plant_parts', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->text('description')->nullable()->after('name_en');
            $table->boolean('is_legacy')->default(false)->after('description');
        });

        // Add legacy fields to references table
        Schema::table('references', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('url');
        });

        // Add legacy fields to species_compounds (pivot) table
        Schema::table('species_compounds', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_id')->nullable()->after('id')->index();
            $table->boolean('is_legacy')->default(false)->after('reference_id');
        });
    }

    public function down(): void
    {
        Schema::table('species', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy', 'photo']);
        });

        Schema::table('compounds', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy', 'source', 'species_source']);
        });

        Schema::table('local_names', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy']);
        });

        Schema::table('species_aliases', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy']);
        });

        Schema::table('virtues', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy']);
        });

        Schema::table('compound_groups', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'description', 'is_legacy']);
        });

        Schema::table('plant_parts', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'description', 'is_legacy']);
        });

        Schema::table('references', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy']);
        });

        Schema::table('species_compounds', function (Blueprint $table) {
            $table->dropColumn(['legacy_id', 'is_legacy']);
        });
    }
};
