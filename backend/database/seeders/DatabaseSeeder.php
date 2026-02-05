<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Usage:
     * - Development: php artisan db:seed
     * - Production with legacy data: php artisan herbaldb:import-legacy --fresh --force
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Check if legacy data import is requested via environment
        if (env('IMPORT_LEGACY_DATA', false)) {
            $this->command->info('Importing legacy data...');
            $this->call([
                LegacyDataSeeder::class,
            ]);
        } else {
            // Use sample data for development
            $this->command->info('Using sample data for development...');
            $this->call([
                SampleDataSeeder::class,
            ]);
        }
    }
}
