<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class MolFileController extends Controller
{
    /**
     * List all MOL files available for download
     */
    public function index(): JsonResponse
    {
        $mol1Path = public_path('mol/mol1');
        $mol2Path = public_path('mol/mol2');
        
        $mol1Files = [];
        $mol2Files = [];
        
        // Get MOL1 files
        if (File::isDirectory($mol1Path)) {
            $files = File::files($mol1Path);
            foreach ($files as $file) {
                if (strtolower($file->getExtension()) === 'mol') {
                    $filename = $file->getFilename();
                    $name = pathinfo($filename, PATHINFO_FILENAME);
                    $mol1Files[] = [
                        'name' => $name,
                        'filename' => $filename,
                        'folder' => 'mol1',
                        'url' => 'mol/mol1/' . rawurlencode($filename),
                    ];
                }
            }
        }
        
        // Get MOL2 files - extract name from file content
        if (File::isDirectory($mol2Path)) {
            $files = File::files($mol2Path);
            foreach ($files as $file) {
                $ext = strtolower($file->getExtension());
                if ($ext === 'mol' || $ext === 'mol2') {
                    $filename = $file->getFilename();
                    
                    // Try to extract Metabolite Name from file content
                    $name = $this->extractMetaboliteName($file->getPathname());
                    if (!$name) {
                        $name = pathinfo($filename, PATHINFO_FILENAME);
                    }
                    
                    $mol2Files[] = [
                        'name' => $name,
                        'filename' => $filename,
                        'original_filename' => $filename,
                        'folder' => 'mol2',
                        'url' => 'mol/mol2/' . rawurlencode($filename),
                    ];
                }
            }
        }
        
        // Sort alphabetically by name
        usort($mol1Files, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($mol2Files, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        
        return response()->json([
            'mol1' => $mol1Files,
            'mol2' => $mol2Files,
            'total_mol1' => count($mol1Files),
            'total_mol2' => count($mol2Files),
        ]);
    }
    
    /**
     * Extract Metabolite Name from MOL2 file content
     */
    private function extractMetaboliteName(string $filepath): ?string
    {
        try {
            // Read first 500 bytes to find the Metabolite Name
            $handle = fopen($filepath, 'r');
            if (!$handle) return null;
            
            $content = fread($handle, 500);
            fclose($handle);
            
            if (preg_match('/^#\s*Metabolite\s*Name\s*:\s*(.+)$/mi', $content, $matches)) {
                return trim($matches[1]);
            }
        } catch (\Exception $e) {
            // Ignore errors
        }
        return null;
    }
    
    /**
     * Download a specific MOL file
     */
    public function download(string $folder, string $filename): mixed
    {
        if (!in_array($folder, ['mol1', 'mol2'])) {
            return response()->json(['error' => 'Invalid folder'], 404);
        }
        
        $path = public_path("mol/{$folder}/{$filename}");
        
        if (!File::exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        // For MOL2 files, try to get proper name from content
        $downloadName = $filename;
        if ($folder === 'mol2') {
            $metaboliteName = $this->extractMetaboliteName($path);
            if ($metaboliteName) {
                // Sanitize for filename
                $safeName = preg_replace('/[<>:"\/\\|?*]/', '_', $metaboliteName);
                $ext = pathinfo($filename, PATHINFO_EXTENSION);
                $downloadName = $safeName . '.' . $ext;
            }
        }
        
        return response()->download($path, $downloadName, [
            'Content-Type' => 'chemical/x-mol',
            'Content-Disposition' => 'attachment; filename="' . $downloadName . '"',
        ]);
    }
}
