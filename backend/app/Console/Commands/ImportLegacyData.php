<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ImportLegacyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'herbaldb:import-legacy 
                            {--fresh : Drop all tables and re-run all migrations before importing}
                            {--force : Force the operation to run in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import legacy herbal database from SQL dump file';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║          HerbalDB Legacy Data Import                       ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->newLine();

        // Check if legacy SQL file exists
        $legacySqlPath = base_path('../old-herbaldb/ta_update.sql');
        if (!file_exists($legacySqlPath)) {
            $this->error('Legacy SQL file not found at: ' . $legacySqlPath);
            $this->info('Please ensure the file exists before running this command.');
            return Command::FAILURE;
        }

        $this->info('Legacy SQL file found: ' . $legacySqlPath);
        $fileSize = round(filesize($legacySqlPath) / 1024 / 1024, 2);
        $this->info("File size: {$fileSize} MB");
        $this->newLine();

        // Confirm action
        if (!$this->option('force')) {
            if (!$this->confirm('This will import legacy data into the database. Continue?', true)) {
                $this->info('Import cancelled.');
                return Command::SUCCESS;
            }
        }

        // Fresh migration if requested
        if ($this->option('fresh')) {
            $this->warn('Running fresh migration (all data will be deleted)...');
            
            if (!$this->option('force') && !$this->confirm('Are you sure you want to delete all data?', false)) {
                $this->info('Import cancelled.');
                return Command::SUCCESS;
            }

            $this->call('migrate:fresh', [
                '--force' => true,
            ]);
            
            $this->info('Fresh migration completed.');
            $this->newLine();
        } else {
            // Just run migrations
            $this->info('Running migrations...');
            $this->call('migrate', [
                '--force' => $this->option('force'),
            ]);
            $this->newLine();
        }

        // Run the legacy seeder
        $this->info('Starting legacy data import...');
        $this->newLine();

        $startTime = microtime(true);
        
        try {
            $this->call('db:seed', [
                '--class' => 'Database\\Seeders\\LegacyDataSeeder',
                '--force' => true,
            ]);
        } catch (\Exception $e) {
            $this->error('Import failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);

        $this->newLine();
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║          Import Completed Successfully!                    ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->info("Time elapsed: {$duration} seconds");
        $this->newLine();

        // Show summary
        $this->showSummary();

        return Command::SUCCESS;
    }

    /**
     * Show import summary
     */
    protected function showSummary(): void
    {
        $this->info('Import Summary:');
        $this->table(
            ['Table', 'Total Records', 'Legacy Records'],
            [
                ['references', \DB::table('references')->count(), \DB::table('references')->where('is_legacy', true)->count()],
                ['compound_groups', \DB::table('compound_groups')->count(), \DB::table('compound_groups')->where('is_legacy', true)->count()],
                ['plant_parts', \DB::table('plant_parts')->count(), \DB::table('plant_parts')->where('is_legacy', true)->count()],
                ['species', \DB::table('species')->count(), \DB::table('species')->where('is_legacy', true)->count()],
                ['compounds', \DB::table('compounds')->count(), \DB::table('compounds')->where('is_legacy', true)->count()],
                ['local_names', \DB::table('local_names')->count(), \DB::table('local_names')->where('is_legacy', true)->count()],
                ['species_aliases', \DB::table('species_aliases')->count(), \DB::table('species_aliases')->where('is_legacy', true)->count()],
                ['virtues', \DB::table('virtues')->count(), \DB::table('virtues')->where('is_legacy', true)->count()],
                ['species_compounds', \DB::table('species_compounds')->count(), \DB::table('species_compounds')->where('is_legacy', true)->count()],
            ]
        );
    }
}
