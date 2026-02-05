<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Compound;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class LinkMolFilesSeeder extends Seeder
{
    /**
     * Link MOL files to compounds using multiple matching strategies
     * Based on legacy parser_mol.php logic
     */
    public function run(): void
    {
        $this->command->info('Linking MOL files to compounds...');
        $this->command->newLine();

        // Link MOL1 files (matched by compound name)
        $mol1Linked = $this->linkMolFiles('mol1', 'mol_file_path', 'name');
        
        // Link MOL2 files (matched by metabolite_id)  
        $mol2Linked = $this->linkMolFiles('mol2', 'mol2_file_path', 'metabolite_id');

        $this->command->newLine();
        $this->command->info("=== SUMMARY ===");
        $this->command->info("MOL1 files linked: {$mol1Linked}");
        $this->command->info("MOL2 files linked: {$mol2Linked}");
        
        // Show stats
        $totalCompounds = Compound::count();
        $withMol = Compound::whereNotNull('mol_file_path')->count();
        $this->command->info("Total compounds: {$totalCompounds}");
        $this->command->info("Compounds with MOL: {$withMol} (" . round($withMol/$totalCompounds*100, 1) . "%)");
        
        // Copy MOL files to public folder
        $this->copyMolFilesToPublic();
    }

    /**
     * Link MOL files from a specific folder
     */
    private function linkMolFiles(string $molFolder, string $dbField, string $matchField): int
    {
        $molPath = base_path("../old-herbaldb/mol/{$molFolder}");
        
        if (!File::isDirectory($molPath)) {
            $this->command->warn("MOL directory not found: {$molPath}");
            return 0;
        }

        $molFiles = File::files($molPath);
        $this->command->info("Processing {$molFolder}: Found " . count($molFiles) . " files");

        // Build lookup arrays with multiple matching strategies
        $exactLookup = [];      // Exact filename match
        $normalizedLookup = []; // Normalized (lowercase, no special chars)
        $fuzzyLookup = [];      // Fuzzy (alphanumeric only)
        
        foreach ($molFiles as $file) {
            $filename = $file->getFilename();
            $baseName = $file->getFilenameWithoutExtension();
            
            // Exact match (case-sensitive)
            $exactLookup[$baseName] = $filename;
            
            // Normalized match (lowercase, trim)
            $normalizedLookup[strtolower(trim($baseName))] = $filename;
            
            // Fuzzy match (alphanumeric only, lowercase)
            $fuzzyLookup[$this->fuzzyNormalize($baseName)] = $filename;
        }

        $compounds = Compound::whereNull($dbField)->orWhere($dbField, '')->get();
        $linked = 0;
        $matchDetails = ['exact' => 0, 'normalized' => 0, 'fuzzy' => 0];

        foreach ($compounds as $compound) {
            $value = $compound->$matchField;
            if (empty($value)) continue;
            
            $matchedFile = null;
            $matchType = null;

            // Strategy 1: Exact match
            if (isset($exactLookup[$value])) {
                $matchedFile = $exactLookup[$value];
                $matchType = 'exact';
            }
            // Strategy 2: Normalized match
            elseif (isset($normalizedLookup[strtolower(trim($value))])) {
                $matchedFile = $normalizedLookup[strtolower(trim($value))];
                $matchType = 'normalized';
            }
            // Strategy 3: Fuzzy match
            elseif (isset($fuzzyLookup[$this->fuzzyNormalize($value)])) {
                $matchedFile = $fuzzyLookup[$this->fuzzyNormalize($value)];
                $matchType = 'fuzzy';
            }

            if ($matchedFile) {
                $compound->$dbField = "mol/{$molFolder}/{$matchedFile}";
                $compound->save();
                $linked++;
                $matchDetails[$matchType]++;
            }
        }

        $this->command->info("  - Linked: {$linked} (exact: {$matchDetails['exact']}, normalized: {$matchDetails['normalized']}, fuzzy: {$matchDetails['fuzzy']})");
        
        return $linked;
    }

    /**
     * Fuzzy normalize for maximum matching
     */
    private function fuzzyNormalize(string $name): string
    {
        // Convert to lowercase
        $name = strtolower($name);
        // Remove all non-alphanumeric characters
        $name = preg_replace('/[^a-z0-9]/', '', $name);
        return $name;
    }

    /**
     * Copy MOL files to public folder for web access
     */
    private function copyMolFilesToPublic(): void
    {
        $this->command->newLine();
        $this->command->info('Copying MOL files to public folder...');

        $sourceDirs = [
            base_path('../old-herbaldb/mol/mol1') => public_path('mol/mol1'),
            base_path('../old-herbaldb/mol/mol2') => public_path('mol/mol2'),
        ];

        foreach ($sourceDirs as $source => $destination) {
            if (!File::isDirectory($source)) {
                continue;
            }

            // Create destination directory
            if (!File::isDirectory($destination)) {
                File::makeDirectory($destination, 0755, true);
            }

            // Copy files
            $files = File::files($source);
            $copied = 0;
            foreach ($files as $file) {
                $destPath = $destination . '/' . $file->getFilename();
                if (!File::exists($destPath)) {
                    File::copy($file->getPathname(), $destPath);
                    $copied++;
                }
            }
            
            $folderName = basename($source);
            $this->command->info("  - {$folderName}: Copied {$copied} new files");
        }
    }
}
