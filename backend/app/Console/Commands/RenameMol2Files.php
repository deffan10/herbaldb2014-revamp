<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class RenameMol2Files extends Command
{
    protected $signature = 'mol:rename-mol2 {--dry-run : Show what would be renamed without actually renaming}';
    protected $description = 'Rename MOL2 files based on Metabolite Name inside the file';

    public function handle()
    {
        $mol2Path = public_path('mol/mol2');
        $dryRun = $this->option('dry-run');

        if (!File::isDirectory($mol2Path)) {
            $this->error("MOL2 directory not found: {$mol2Path}");
            return 1;
        }

        $files = File::files($mol2Path);
        $renamed = 0;
        $skipped = 0;
        $errors = 0;

        $this->info($dryRun ? "DRY RUN - No files will be renamed\n" : "Renaming MOL2 files...\n");

        foreach ($files as $file) {
            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['mol2', 'mol'])) {
                continue;
            }

            $currentName = $file->getFilename();
            $currentPath = $file->getPathname();

            // Read file and find Metabolite Name
            $content = File::get($currentPath);
            $metaboliteName = $this->extractMetaboliteName($content);

            if (!$metaboliteName) {
                $this->warn("  SKIP: {$currentName} - No Metabolite Name found");
                $skipped++;
                continue;
            }

            // Sanitize filename (remove invalid characters)
            $safeName = $this->sanitizeFilename($metaboliteName);
            $newFilename = $safeName . '.' . $ext;

            // Check if already named correctly
            if ($currentName === $newFilename) {
                $this->line("  OK: {$currentName} (already correct)");
                $skipped++;
                continue;
            }

            $newPath = $mol2Path . DIRECTORY_SEPARATOR . $newFilename;

            // Check if target exists
            if (File::exists($newPath) && $newPath !== $currentPath) {
                $this->warn("  SKIP: {$currentName} -> {$newFilename} (target exists)");
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->info("  WOULD RENAME: {$currentName} -> {$newFilename}");
                $renamed++;
            } else {
                try {
                    File::move($currentPath, $newPath);
                    $this->info("  RENAMED: {$currentName} -> {$newFilename}");
                    $renamed++;
                } catch (\Exception $e) {
                    $this->error("  ERROR: {$currentName} - " . $e->getMessage());
                    $errors++;
                }
            }
        }

        $this->newLine();
        $this->info("Summary:");
        $this->line("  Renamed: {$renamed}");
        $this->line("  Skipped: {$skipped}");
        $this->line("  Errors: {$errors}");

        return 0;
    }

    private function extractMetaboliteName(string $content): ?string
    {
        // Look for "# Metabolite Name:" pattern
        if (preg_match('/^#\s*Metabolite\s*Name\s*:\s*(.+)$/mi', $content, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    private function sanitizeFilename(string $name): string
    {
        // Replace characters that are invalid in filenames
        $invalid = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
        $name = str_replace($invalid, '_', $name);
        
        // Remove leading/trailing spaces and dots
        $name = trim($name, " \t\n\r\0\x0B.");
        
        // Limit length (Windows max is 255, but be safe)
        if (strlen($name) > 200) {
            $name = substr($name, 0, 200);
        }
        
        return $name;
    }
}
