<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class LegacyDataSeeder extends Seeder
{
    protected $legacySqlPath;
    protected $sqlContent;
    protected $insertStatements = [];

    // Mapping legacy table to new table
    protected $tableMapping = [
        'ref' => 'references',
        'contentgroup' => 'compound_groups',
        'herbal_part' => 'plant_parts',
        'species' => 'species',
        'contents' => 'compounds',
        'localname' => 'local_names',
        'aliases' => 'species_aliases',
        'virtue' => 'virtues',
        'speciescontent' => 'species_compounds',
    ];

    public function run(): void
    {
        // Path to legacy SQL file
        $this->legacySqlPath = base_path('../old-herbaldb/ta_update.sql');

        if (!File::exists($this->legacySqlPath)) {
            $this->command->warn('Legacy SQL file not found at: ' . $this->legacySqlPath);
            $this->command->info('Skipping legacy data import.');
            return;
        }

        $this->command->info('Starting legacy data import from: ' . $this->legacySqlPath);
        $this->sqlContent = File::get($this->legacySqlPath);

        // Import in order (due to foreign key constraints)
        $this->importReferences();
        $this->importCompoundGroups();
        $this->importPlantParts();
        $this->importSpecies();
        $this->importCompounds();
        $this->importLocalNames();
        $this->importSpeciesAliases();
        $this->importVirtues();
        $this->importSpeciesCompounds();

        $this->command->info('Legacy data import completed!');
    }

    /**
     * Extract INSERT statements for a specific table from SQL dump
     */
    protected function extractInserts(string $tableName): array
    {
        $pattern = "/INSERT INTO `{$tableName}` .*?VALUES\s*(.*?);/s";
        $results = [];
        
        if (preg_match_all($pattern, $this->sqlContent, $matches)) {
            foreach ($matches[1] as $valuesBlock) {
                // Parse individual rows
                $rows = $this->parseValuesBlock($valuesBlock);
                $results = array_merge($results, $rows);
            }
        }
        
        return $results;
    }

    /**
     * Parse VALUES block into individual row arrays
     */
    protected function parseValuesBlock(string $block): array
    {
        $rows = [];
        $depth = 0;
        $current = '';
        $inString = false;
        $escape = false;
        
        for ($i = 0; $i < strlen($block); $i++) {
            $char = $block[$i];
            
            if ($escape) {
                $current .= $char;
                $escape = false;
                continue;
            }
            
            if ($char === '\\') {
                $current .= $char;
                $escape = true;
                continue;
            }
            
            if ($char === "'" && !$escape) {
                $inString = !$inString;
                $current .= $char;
                continue;
            }
            
            if (!$inString) {
                if ($char === '(') {
                    if ($depth === 0) {
                        $current = '';
                    } else {
                        $current .= $char;
                    }
                    $depth++;
                } elseif ($char === ')') {
                    $depth--;
                    if ($depth === 0) {
                        $rows[] = $this->parseRow($current);
                    } else {
                        $current .= $char;
                    }
                } else {
                    if ($depth > 0) {
                        $current .= $char;
                    }
                }
            } else {
                $current .= $char;
            }
        }
        
        return $rows;
    }

    /**
     * Parse a single row string into array of values
     */
    protected function parseRow(string $row): array
    {
        $values = [];
        $current = '';
        $inString = false;
        $escape = false;
        
        for ($i = 0; $i < strlen($row); $i++) {
            $char = $row[$i];
            
            if ($escape) {
                $current .= $char;
                $escape = false;
                continue;
            }
            
            if ($char === '\\') {
                $escape = true;
                continue;
            }
            
            if ($char === "'" && !$escape) {
                $inString = !$inString;
                continue;
            }
            
            if (!$inString && $char === ',') {
                $values[] = $this->cleanValue(trim($current));
                $current = '';
            } else {
                $current .= $char;
            }
        }
        
        $values[] = $this->cleanValue(trim($current));
        
        return $values;
    }

    /**
     * Clean and convert value
     */
    protected function cleanValue(string $value): mixed
    {
        if ($value === 'NULL' || $value === '') {
            return null;
        }
        
        // Remove surrounding quotes if present
        if (preg_match("/^'(.*)'$/s", $value, $matches)) {
            return stripslashes($matches[1]);
        }
        
        // Check if numeric
        if (is_numeric($value)) {
            return strpos($value, '.') !== false ? (float)$value : (int)$value;
        }
        
        return $value;
    }

    /**
     * Import references table
     */
    protected function importReferences(): void
    {
        $this->command->info('Importing references...');
        
        $rows = $this->extractInserts('ref');
        $this->command->info("Found " . count($rows) . " reference records");
        
        // ref: ref_id, ref_name, ref_insert_by, ref_insert_date, ref_update_by, ref_update_date, ref_verified_by, ref_verified_date
        foreach ($rows as $row) {
            if (count($row) >= 2) {
                try {
                    DB::table('references')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'source_name' => $row[1] ?? 'Unknown',
                            'authors' => null,
                            'year' => null,
                            'type' => 'book',
                            'url' => null,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                } catch (\Exception $e) {
                    Log::warning("Failed to import reference: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info('References imported successfully!');
    }

    /**
     * Import compound groups (contentgroup)
     */
    protected function importCompoundGroups(): void
    {
        $this->command->info('Importing compound groups...');
        
        $rows = $this->extractInserts('contentgroup');
        $this->command->info("Found " . count($rows) . " compound group records");
        
        // contentgroup: contgroup_id, contgroup_code, contgroup_name, ...
        foreach ($rows as $row) {
            if (count($row) >= 3) {
                try {
                    DB::table('compound_groups')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'code' => $row[1] ?? 'G' . str_pad($row[0], 4, '0', STR_PAD_LEFT),
                            'name' => $row[2] ?? 'Unknown',
                            'description' => null,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                } catch (\Exception $e) {
                    Log::warning("Failed to import compound group: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info('Compound groups imported successfully!');
    }

    /**
     * Import plant parts (herbal_part)
     */
    protected function importPlantParts(): void
    {
        $this->command->info('Importing plant parts...');
        
        $rows = $this->extractInserts('herbal_part');
        $this->command->info("Found " . count($rows) . " plant part records");
        
        // herbal_part: hp_id, hp_code, hp_part_name
        foreach ($rows as $row) {
            if (count($row) >= 3) {
                try {
                    DB::table('plant_parts')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'code' => $row[1] ?? 'HP' . str_pad($row[0], 3, '0', STR_PAD_LEFT),
                            'name' => trim($row[2] ?? 'Unknown'),
                            'name_en' => null,
                            'description' => null,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                } catch (\Exception $e) {
                    Log::warning("Failed to import plant part: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info('Plant parts imported successfully!');
    }

    /**
     * Import species
     */
    protected function importSpecies(): void
    {
        $this->command->info('Importing species...');
        
        $rows = $this->extractInserts('species');
        $this->command->info("Found " . count($rows) . " species records");
        
        // species: spe_id, spe_species_id, spe_speciesname, spe_varietyname, spe_familyname, 
        //          spe_foundername, spe_foto, ref_id, spe_insert_by, spe_insert_date,
        //          spe_update_by, spe_update_date, spe_verified_by, spe_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 7) {
                try {
                    // Get reference_id from mapping
                    $refId = null;
                    if (!empty($row[7])) {
                        $ref = DB::table('references')->where('legacy_id', $row[7])->first();
                        $refId = $ref ? $ref->id : null;
                    }
                    
                    DB::table('species')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'species_code' => $row[1] ?? 'SPE' . str_pad($row[0], 6, '0', STR_PAD_LEFT),
                            'scientific_name' => $row[2] ?? 'Unknown',
                            'variety' => $row[3] ?? null,
                            'family' => $row[4] ?? null,
                            'discoverer' => $row[5] ?? null,
                            'photo' => $row[6] ?? null,
                            'description' => null,
                            'description_en' => null,
                            'status' => 'published', // Legacy data is already verified
                            'is_legacy' => true,
                            'reference_id' => $refId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import species {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Species imported successfully! ({$count} records)");
    }

    /**
     * Import compounds (contents)
     */
    protected function importCompounds(): void
    {
        $this->command->info('Importing compounds...');
        
        $rows = $this->extractInserts('contents');
        $this->command->info("Found " . count($rows) . " compound records");
        
        // contents: con_id, con_contentname, con_knapsack_id, con_metabolite_id, con_pubchem_id,
        //           contgroup_id, con_source, con_speciesname, con_file_mol1, con_file_mol2,
        //           con_insert_by, con_insert_date, con_update_by, con_update_date,
        //           con_verified_by, con_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 5) {
                try {
                    // Get compound_group_id from mapping
                    $groupId = null;
                    if (!empty($row[5])) {
                        $group = DB::table('compound_groups')->where('legacy_id', $row[5])->first();
                        $groupId = $group ? $group->id : null;
                    }
                    
                    DB::table('compounds')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'name' => $row[1] ?? 'Unknown',
                            'knapsack_id' => $row[2] ?? null,
                            'metabolite_id' => $row[3] ?? null,
                            'pubchem_id' => $row[4] ?? null,
                            'compound_group_id' => $groupId,
                            'source' => $row[6] ?? null,
                            'species_source' => $row[7] ?? null,
                            'mol_file_path' => $row[8] ? 'mol/mol1/' . $row[8] : null,
                            'mol2_file_path' => $row[9] ? 'mol/mol2/' . $row[9] : null,
                            'status' => 'published', // Legacy data is already verified
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import compound {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Compounds imported successfully! ({$count} records)");
    }

    /**
     * Import local names
     */
    protected function importLocalNames(): void
    {
        $this->command->info('Importing local names...');
        
        $rows = $this->extractInserts('localname');
        $this->command->info("Found " . count($rows) . " local name records");
        
        // localname: loc_id, spe_id, loc_localname, loc_region, ref_id,
        //            loc_insert_by, loc_insert_date, loc_update_by, loc_update_date,
        //            loc_verified_by, loc_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 4) {
                try {
                    // Get species_id from mapping
                    $speciesId = null;
                    if (!empty($row[1])) {
                        $species = DB::table('species')->where('legacy_id', $row[1])->first();
                        $speciesId = $species ? $species->id : null;
                    }
                    
                    if (!$speciesId) continue; // Skip if species not found
                    
                    // Get reference_id from mapping
                    $refId = null;
                    if (!empty($row[4])) {
                        $ref = DB::table('references')->where('legacy_id', $row[4])->first();
                        $refId = $ref ? $ref->id : null;
                    }
                    
                    DB::table('local_names')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'species_id' => $speciesId,
                            'name' => $row[2] ?? 'Unknown',
                            'region' => $row[3] ?? null,
                            'reference_id' => $refId,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import local name {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Local names imported successfully! ({$count} records)");
    }

    /**
     * Import species aliases
     */
    protected function importSpeciesAliases(): void
    {
        $this->command->info('Importing species aliases...');
        
        $rows = $this->extractInserts('aliases');
        $this->command->info("Found " . count($rows) . " alias records");
        
        // aliases: ali_id, spe_id, ali_speciesname, ali_foundername, ali_varietyname, ref_id,
        //          ali_insert_by, ali_insert_date, ali_update_by, ali_update_date,
        //          ali_verified_by, ali_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 5) {
                try {
                    // Get species_id from mapping
                    $speciesId = null;
                    if (!empty($row[1])) {
                        $species = DB::table('species')->where('legacy_id', $row[1])->first();
                        $speciesId = $species ? $species->id : null;
                    }
                    
                    if (!$speciesId) continue; // Skip if species not found
                    
                    // Get reference_id from mapping
                    $refId = null;
                    if (!empty($row[5])) {
                        $ref = DB::table('references')->where('legacy_id', $row[5])->first();
                        $refId = $ref ? $ref->id : null;
                    }
                    
                    DB::table('species_aliases')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'species_id' => $speciesId,
                            'alias_name' => $row[2] ?? 'Unknown',
                            'discoverer' => $row[3] ?? null,
                            'variety' => $row[4] ?? null,
                            'reference_id' => $refId,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import alias {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Species aliases imported successfully! ({$count} records)");
    }

    /**
     * Import virtues
     */
    protected function importVirtues(): void
    {
        $this->command->info('Importing virtues...');
        
        $rows = $this->extractInserts('virtue');
        $this->command->info("Found " . count($rows) . " virtue records");
        
        // virtue: vir_id, spe_id, hp_code, vir_type, vir_value, vir_value_en, vir_value_latin,
        //         ref_id, vir_insert_by, vir_insert_date, vir_update_by, vir_update_date,
        //         vir_verified_by, vir_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 5) {
                try {
                    // Get species_id from mapping
                    $speciesId = null;
                    if (!empty($row[1])) {
                        $species = DB::table('species')->where('legacy_id', $row[1])->first();
                        $speciesId = $species ? $species->id : null;
                    }
                    
                    if (!$speciesId) continue; // Skip if species not found
                    
                    // Get plant_part_id from mapping (by legacy_id which stores hp_id)
                    $plantPartId = null;
                    if (!empty($row[2])) {
                        $part = DB::table('plant_parts')->where('legacy_id', $row[2])->first();
                        $plantPartId = $part ? $part->id : null;
                    }
                    
                    // Get reference_id from mapping
                    $refId = null;
                    if (!empty($row[7])) {
                        $ref = DB::table('references')->where('legacy_id', $row[7])->first();
                        $refId = $ref ? $ref->id : null;
                    }
                    
                    DB::table('virtues')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'species_id' => $speciesId,
                            'plant_part_id' => $plantPartId,
                            'virtue_type' => $row[3] ?? 'general',
                            'description' => $row[4] ?? null,
                            'description_en' => $row[5] ?? null,
                            'description_latin' => $row[6] ?? null,
                            'reference_id' => $refId,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import virtue {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Virtues imported successfully! ({$count} records)");
    }

    /**
     * Import species-compound relationships
     */
    protected function importSpeciesCompounds(): void
    {
        $this->command->info('Importing species-compound relationships...');
        
        $rows = $this->extractInserts('speciescontent');
        $this->command->info("Found " . count($rows) . " relationship records");
        
        // speciescontent: specon_id, spe_id, con_id, ref_id,
        //                 specon_insert_by, specon_insert_date, specon_update_by, specon_update_date,
        //                 specon_verified_by, specon_verified_date
        $count = 0;
        foreach ($rows as $row) {
            if (count($row) >= 3) {
                try {
                    // Get species_id from mapping
                    $speciesId = null;
                    if (!empty($row[1])) {
                        $species = DB::table('species')->where('legacy_id', $row[1])->first();
                        $speciesId = $species ? $species->id : null;
                    }
                    
                    // Get compound_id from mapping
                    $compoundId = null;
                    if (!empty($row[2])) {
                        $compound = DB::table('compounds')->where('legacy_id', $row[2])->first();
                        $compoundId = $compound ? $compound->id : null;
                    }
                    
                    if (!$speciesId || !$compoundId) continue; // Skip if either not found
                    
                    // Get reference_id from mapping
                    $refId = null;
                    if (!empty($row[3])) {
                        $ref = DB::table('references')->where('legacy_id', $row[3])->first();
                        $refId = $ref ? $ref->id : null;
                    }
                    
                    DB::table('species_compounds')->updateOrInsert(
                        ['legacy_id' => $row[0]],
                        [
                            'species_id' => $speciesId,
                            'compound_id' => $compoundId,
                            'reference_id' => $refId,
                            'is_legacy' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to import species-compound {$row[0]}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Species-compound relationships imported successfully! ({$count} records)");
    }
}
